package com.tecnooro.servicio;

import com.tecnooro.error.ErrorApi;
import com.tecnooro.modelo.Pedido;
import com.tecnooro.modelo.Producto;
import com.tecnooro.modelo.Usuario;
import com.tecnooro.repositorio.PedidoRepositorio;
import com.tecnooro.repositorio.ProductoRepositorio;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CatalogoServicio {

  private static final List<String> TIPOS = List.of("servicio", "celular", "accesorio");
  private static final List<String> ESTADOS = List.of("EN_PREPARACION", "LISTO_ENTREGA");

  private final ProductoRepositorio productos;
  private final PedidoRepositorio pedidos;

  public CatalogoServicio(ProductoRepositorio productos, PedidoRepositorio pedidos) {
    this.productos = productos;
    this.pedidos = pedidos;
  }

  public List<Producto> listarProductos() {
    return productos.findAll();
  }

  public Producto buscarProducto(Long id) {
    return productos.findById(id).orElseThrow(() -> new ErrorApi(404, "No encontramos ese producto."));
  }

  @Transactional
  public Producto crearProducto(Map<String, Object> datos) {
    Producto producto = leer(datos);
    return productos.save(producto);
  }

  @Transactional
  public Producto actualizarProducto(Long id, Map<String, Object> datos) {
    Producto actual = buscarProducto(id);
    Producto leido = leer(datos);
    actual.setTipo(leido.getTipo());
    actual.setNombre(leido.getNombre());
    actual.setDetalle(leido.getDetalle());
    actual.setPrecio(leido.getPrecio());
    actual.setImagen(leido.getImagen());
    return productos.save(actual);
  }

  @Transactional
  public Map<String, Object> eliminarProducto(Long id) {
    Producto producto = buscarProducto(id);
    if (pedidos.countByProductoId(producto.getId()) > 0) {
      throw new ErrorApi(400, "No se puede borrar: ya hay pedidos con este producto.");
    }
    productos.delete(producto);
    Map<String, Object> cuerpo = new LinkedHashMap<>();
    cuerpo.put("mensaje", "Producto eliminado.");
    cuerpo.put("id", producto.getId());
    return cuerpo;
  }

  @Transactional
  public Map<String, Object> crearPedido(Usuario usuario, Map<String, Object> datos) {
    if ("ADMIN".equals(usuario.getRol())) {
      throw new ErrorApi(403, "Con la cuenta de administrador no se pueden hacer pedidos.");
    }
    long productoId = numeroEntero(datos.get("productoId"), "productoId es obligatorio");
    int cantidad = (int) numeroEntero(datos.get("cantidad"), "La cantidad debe ser un entero mayor a 0");
    if (cantidad < 1) {
      throw new ErrorApi(400, "La cantidad debe ser un entero mayor a 0");
    }
    Producto producto = buscarProducto(productoId);
    Pedido pedido = new Pedido();
    pedido.setUsuario(usuario);
    pedido.setProducto(producto);
    pedido.setCantidad(cantidad);
    pedido.setEstado("EN_PREPARACION");
    pedido.setCreadoEn(Instant.now());
    pedidos.save(pedido);
    Map<String, Object> cuerpo = new LinkedHashMap<>();
    cuerpo.put("mensaje", "Pedido registrado");
    cuerpo.put("pedido", vista(pedido));
    return cuerpo;
  }

  @Transactional(readOnly = true)
  public List<Map<String, Object>> listarPedidos(Usuario usuario) {
    List<Pedido> filas = "ADMIN".equals(usuario.getRol())
        ? pedidos.findAllByOrderByIdAsc()
        : pedidos.findByUsuarioIdOrderByIdAsc(usuario.getId());
    return filas.stream().map(this::vista).toList();
  }

  @Transactional(readOnly = true)
  public Map<String, Object> buscarPedido(Long id, Usuario usuario) {
    Pedido pedido = pedidos.findById(id).orElseThrow(() -> new ErrorApi(404, "No encontramos ese pedido."));
    if (!"ADMIN".equals(usuario.getRol()) && !pedido.getUsuario().getId().equals(usuario.getId())) {
      throw new ErrorApi(403, "No puedes ver este pedido.");
    }
    return vista(pedido);
  }

  @Transactional
  public Map<String, Object> cambiarEstadoPedido(Long id, String estado) {
    if (!ESTADOS.contains(estado)) {
      throw new ErrorApi(400, "Estado de pedido no válido.");
    }
    Pedido pedido = pedidos.findById(id).orElseThrow(() -> new ErrorApi(404, "No encontramos ese pedido."));
    pedido.setEstado(estado);
    pedidos.save(pedido);
    return vista(pedido);
  }

  private Producto leer(Map<String, Object> datos) {
    String tipo = texto(datos.get("tipo")).toLowerCase();
    String nombre = texto(datos.get("nombre"));
    String detalle = texto(datos.get("detalle"));
    double precio = numero(datos.get("precio"));
    String imagen = texto(datos.get("imagen"));
    if (!TIPOS.contains(tipo)) {
      throw new ErrorApi(400, "El tipo debe ser servicio, celular o accesorio");
    }
    if (nombre.length() < 2) {
      throw new ErrorApi(400, "El nombre es obligatorio");
    }
    if (detalle.isBlank()) {
      throw new ErrorApi(400, "El detalle es obligatorio");
    }
    if (Double.isNaN(precio) || precio < 0) {
      throw new ErrorApi(400, "El precio no es válido");
    }
    if (imagen.isBlank()) {
      imagen = "img/local.jpg";
    }
    if (!imagen.startsWith("img/") && !imagen.startsWith("/img/")) {
      imagen = "img/" + imagen.replaceFirst("^/", "");
    }
    imagen = imagen.replaceFirst("^/", "");
    Producto producto = new Producto();
    producto.setTipo(tipo);
    producto.setNombre(nombre);
    producto.setDetalle(detalle);
    producto.setPrecio(precio);
    producto.setImagen(imagen);
    return producto;
  }

  private Map<String, Object> vista(Pedido pedido) {
    Usuario cliente = pedido.getUsuario();
    Producto producto = pedido.getProducto();
    Map<String, Object> vista = new LinkedHashMap<>();
    vista.put("id", pedido.getId());
    vista.put("cantidad", pedido.getCantidad());
    vista.put("estado", pedido.getEstado());
    vista.put("creadoEn", pedido.getCreadoEn());
    vista.put("usuarioId", cliente.getId());
    vista.put("productoId", producto.getId());
    vista.put("clienteNombre", cliente.getNombre());
    vista.put("correo", cliente.getCorreo());
    vista.put("productoTipo", producto.getTipo());
    vista.put("producto", producto.getNombre());
    vista.put("productoDetalle", producto.getDetalle());
    vista.put("precio", producto.getPrecio());
    return vista;
  }

  private static String texto(Object valor) {
    return String.valueOf(valor == null ? "" : valor).trim();
  }

  private static double numero(Object valor) {
    try {
      return Double.parseDouble(texto(valor));
    } catch (NumberFormatException error) {
      return Double.NaN;
    }
  }

  private static long numeroEntero(Object valor, String mensaje) {
    try {
      double numero = Double.parseDouble(texto(valor));
      if (numero < 1 || numero != Math.rint(numero)) {
        throw new ErrorApi(400, mensaje);
      }
      return (long) numero;
    } catch (NumberFormatException error) {
      throw new ErrorApi(400, mensaje);
    }
  }
}
