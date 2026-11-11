package com.tecnooro.controlador;

import com.tecnooro.servicio.CatalogoServicio;
import com.tecnooro.servicio.UsuarioServicio;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminControlador {

  private final UsuarioServicio usuarios;
  private final CatalogoServicio catalogo;

  public AdminControlador(UsuarioServicio usuarios, CatalogoServicio catalogo) {
    this.usuarios = usuarios;
    this.catalogo = catalogo;
  }

  @GetMapping("/usuarios")
  public Map<String, Object> usuarios() {
    return Map.of("usuarios", usuarios.listar());
  }

  @PatchMapping("/usuarios/{id}/estado")
  public Map<String, Object> estado(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> datos) {
    String estado = datos == null ? "" : String.valueOf(datos.get("estado") == null ? "" : datos.get("estado"));
    return usuarios.cambiarEstado(id, estado);
  }

  @DeleteMapping("/usuarios/{id}")
  public Map<String, Object> eliminarUsuario(@PathVariable Long id) {
    return usuarios.eliminar(id);
  }

  @GetMapping("/productos")
  public Map<String, Object> productos() {
    return Map.of("productos", catalogo.listarProductos());
  }

  @PostMapping("/productos")
  @ResponseStatus(HttpStatus.CREATED)
  public Map<String, Object> crearProducto(@RequestBody(required = false) Map<String, Object> datos) {
    return Map.of("mensaje", "Producto creado", "producto", catalogo.crearProducto(datos == null ? Map.of() : datos));
  }

  @PutMapping("/productos/{id}")
  public Map<String, Object> actualizarProducto(
      @PathVariable Long id, @RequestBody(required = false) Map<String, Object> datos) {
    return Map.of(
        "mensaje", "Producto actualizado",
        "producto", catalogo.actualizarProducto(id, datos == null ? Map.of() : datos));
  }

  @DeleteMapping("/productos/{id}")
  public Map<String, Object> eliminarProducto(@PathVariable Long id) {
    return catalogo.eliminarProducto(id);
  }

  @PatchMapping("/pedidos/{id}/estado")
  public Map<String, Object> estadoPedido(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> datos) {
    String estado = datos == null ? "" : String.valueOf(datos.get("estado") == null ? "" : datos.get("estado"));
    return Map.of("mensaje", "Estado del pedido actualizado", "pedido", catalogo.cambiarEstadoPedido(id, estado));
  }
}
