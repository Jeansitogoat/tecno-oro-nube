package com.tecnooro.servicio;

import com.tecnooro.error.ErrorApi;
import com.tecnooro.modelo.Usuario;
import com.tecnooro.repositorio.PedidoRepositorio;
import com.tecnooro.repositorio.UsuarioRepositorio;
import com.tecnooro.seguridad.FiltroJwt;
import com.tecnooro.seguridad.JwtServicio;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioServicio {

  private static final List<String> ESTADOS = List.of("PENDIENTE", "APROBADA", "RECHAZADA", "BLOQUEADA");

  private final UsuarioRepositorio usuarios;
  private final PedidoRepositorio pedidos;
  private final PasswordEncoder encoder;
  private final JwtServicio jwt;
  private final CorreoServicio correo;
  private final boolean demo;
  private final int minutosCodigo;

  public UsuarioServicio(
      UsuarioRepositorio usuarios,
      PedidoRepositorio pedidos,
      PasswordEncoder encoder,
      JwtServicio jwt,
      CorreoServicio correo,
      @Value("${app.demo}") boolean demo,
      @Value("${app.minutos-codigo}") int minutosCodigo) {
    this.usuarios = usuarios;
    this.pedidos = pedidos;
    this.encoder = encoder;
    this.jwt = jwt;
    this.correo = correo;
    this.demo = demo;
    this.minutosCodigo = minutosCodigo;
  }

  public Map<String, Object> registrar(Map<String, Object> datos) {
    String nombre = texto(datos.get("nombre"));
    String correo = correo(datos.get("correo"));
    String password = String.valueOf(datos.get("password") == null ? "" : datos.get("password"));
    if (nombre.length() < 2) {
      throw new ErrorApi(400, "El nombre es obligatorio");
    }
    if (!correoValido(correo)) {
      throw new ErrorApi(400, "El correo no es válido");
    }
    if (password.length() < 6) {
      throw new ErrorApi(400, "La contraseña debe tener al menos 6 caracteres");
    }

    Usuario existente = usuarios.findByCorreo(correo).orElse(null);
    if (existente != null) {
      if (existente.isVerificado()) {
        throw new ErrorApi(409, "Ese correo ya tiene cuenta. Entra con tu contraseña.");
      }
      if (!"USER".equals(existente.getRol())) {
        throw new ErrorApi(409, "Ese correo ya está en uso.");
      }
      existente.setNombre(nombre);
      existente.setPasswordHash(encoder.encode(password));
      existente.setEstado("PENDIENTE");
      existente.setVerificado(false);
      guardarCodigo(existente);
      return entrega(usuarios.save(existente), "Te enviamos un código nuevo a tu correo.");
    }

    Usuario nuevo = new Usuario();
    nuevo.setNombre(nombre);
    nuevo.setCorreo(correo);
    nuevo.setPasswordHash(encoder.encode(password));
    nuevo.setRol("USER");
    nuevo.setEstado("PENDIENTE");
    nuevo.setVerificado(false);
    nuevo.setCreadoEn(Instant.now());
    guardarCodigo(nuevo);
    return entrega(usuarios.save(nuevo), "Te enviamos un código a tu correo.");
  }

  public Map<String, Object> reenviar(Map<String, Object> datos) {
    String correo = correo(datos.get("correo"));
    if (!correoValido(correo)) {
      throw new ErrorApi(400, "El correo no es válido");
    }
    Usuario fila = usuarios.findByCorreo(correo)
        .filter(usuario -> "USER".equals(usuario.getRol()))
        .orElseThrow(() -> new ErrorApi(400, "No encontramos una cuenta con ese correo."));
    if (fila.isVerificado()) {
      throw new ErrorApi(400, "Esa cuenta ya está verificada. Entra con tu contraseña.");
    }
    guardarCodigo(fila);
    return entrega(usuarios.save(fila), "Te enviamos un código nuevo a tu correo.");
  }

  @Transactional
  public Map<String, Object> verificar(Map<String, Object> datos) {
    String correo = correo(datos.get("correo"));
    String codigo = texto(datos.get("codigo"));
    Usuario fila = usuarios.findByCorreo(correo)
        .filter(usuario -> "USER".equals(usuario.getRol()))
        .orElseThrow(() -> new ErrorApi(400, "No encontramos una cuenta con ese correo."));
    if (fila.isVerificado()) {
      throw new ErrorApi(400, "Esa cuenta ya está verificada. Entra con tu contraseña.");
    }
    if (fila.getCodigoVerificacion() == null || !fila.getCodigoVerificacion().equals(codigo)) {
      throw new ErrorApi(400, "El código no es correcto.");
    }
    if (fila.getCodigoExpira() == null || fila.getCodigoExpira().isBefore(Instant.now())) {
      throw new ErrorApi(400, "Ese código ya venció. Pide uno nuevo.");
    }
    fila.setVerificado(true);
    fila.setCodigoVerificacion(null);
    fila.setCodigoExpira(null);
    usuarios.save(fila);
    Map<String, Object> cuerpo = new LinkedHashMap<>();
    cuerpo.put("mensaje", "Listo, correo verificado. Cuando el local apruebe tu cuenta ya puedes entrar.");
    cuerpo.put("usuario", publico(fila));
    return cuerpo;
  }

  public Map<String, Object> entrar(Map<String, Object> datos) {
    String correo = correo(datos.get("correo"));
    String password = String.valueOf(datos.get("password") == null ? "" : datos.get("password"));
    Usuario fila = usuarios.findByCorreo(correo).orElse(null);
    if (fila == null || !encoder.matches(password, fila.getPasswordHash())) {
      throw new ErrorApi(401, "Correo o contraseña incorrectos");
    }
    if (!"ADMIN".equals(fila.getRol())) {
      FiltroJwt.exigirClienteActivo(fila);
    }
    Map<String, Object> cuerpo = new LinkedHashMap<>();
    cuerpo.put("mensaje", "Bienvenido");
    cuerpo.put("token", jwt.firmar(fila));
    cuerpo.put("usuario", publico(fila));
    return cuerpo;
  }

  @Transactional
  public Map<String, Object> actualizarPerfil(Usuario fila, Map<String, Object> datos) {
    String nombre = texto(datos.get("nombre"));
    String nueva = String.valueOf(datos.get("passwordNueva") == null ? "" : datos.get("passwordNueva"));
    String actual = String.valueOf(datos.get("passwordActual") == null ? "" : datos.get("passwordActual"));
    if (nombre.length() < 2) {
      throw new ErrorApi(400, "El nombre es obligatorio.");
    }
    if (!nueva.isBlank()) {
      if (nueva.length() < 6) {
        throw new ErrorApi(400, "La contraseña nueva debe tener al menos 6 caracteres.");
      }
      if (actual.isBlank() || !encoder.matches(actual, fila.getPasswordHash())) {
        throw new ErrorApi(400, "La contraseña actual no es correcta.");
      }
      fila.setPasswordHash(encoder.encode(nueva));
    }
    fila.setNombre(nombre);
    usuarios.save(fila);
    Map<String, Object> cuerpo = new LinkedHashMap<>();
    cuerpo.put("mensaje", "Datos actualizados.");
    cuerpo.put("usuario", publico(fila));
    return cuerpo;
  }

  public List<Map<String, Object>> listar() {
    return usuarios.findAll().stream().map(fila -> {
      Map<String, Object> item = new LinkedHashMap<>();
      item.put("id", fila.getId());
      item.put("nombre", fila.getNombre());
      item.put("correo", fila.getCorreo());
      item.put("rol", fila.getRol());
      item.put("estado", fila.getEstado());
      item.put("verificado", fila.isVerificado());
      item.put("creadoEn", fila.getCreadoEn());
      return item;
    }).toList();
  }

  @Transactional
  public Map<String, Object> cambiarEstado(Long id, String estado) {
    if (!ESTADOS.contains(estado)) {
      throw new ErrorApi(400, "Estado no válido.");
    }
    Usuario fila = usuarios.findById(id).orElseThrow(() -> new ErrorApi(404, "No encontramos ese cliente."));
    if ("ADMIN".equals(fila.getRol())) {
      throw new ErrorApi(400, "No se puede cambiar el estado del administrador.");
    }
    if ("APROBADA".equals(estado) && !fila.isVerificado()) {
      throw new ErrorApi(400, "Ese cliente todavía no verificó su correo.");
    }
    fila.setEstado(estado);
    usuarios.save(fila);
    Map<String, Object> cuerpo = new LinkedHashMap<>();
    cuerpo.put("mensaje", "Cliente actualizado.");
    cuerpo.put("usuario", publico(fila));
    return cuerpo;
  }

  @Transactional
  public Map<String, Object> eliminar(Long id) {
    Usuario fila = usuarios.findById(id).orElseThrow(() -> new ErrorApi(404, "No encontramos ese cliente."));
    if ("ADMIN".equals(fila.getRol())) {
      throw new ErrorApi(400, "No se puede eliminar al administrador.");
    }
    pedidos.deleteByUsuarioId(fila.getId());
    usuarios.delete(fila);
    Map<String, Object> cuerpo = new LinkedHashMap<>();
    cuerpo.put("mensaje", "Cliente eliminado.");
    cuerpo.put("id", fila.getId());
    cuerpo.put("correo", fila.getCorreo());
    return cuerpo;
  }

  public Map<String, Object> publico(Usuario fila) {
    Map<String, Object> usuario = new LinkedHashMap<>();
    usuario.put("id", fila.getId());
    usuario.put("nombre", fila.getNombre());
    usuario.put("correo", fila.getCorreo());
    usuario.put("rol", fila.getRol());
    usuario.put("estado", fila.getEstado());
    usuario.put("verificado", fila.isVerificado());
    return usuario;
  }

  private Map<String, Object> entrega(Usuario fila, String mensaje) {
    boolean enviado = correo.enviarCodigo(fila.getCorreo(), fila.getCodigoVerificacion());
    if (!enviado && !demo) {
      String detalle = correo.redBloqueada()
          ? "Esta red bloquea el correo de Gmail. Conéctate al hotspot del teléfono y pulsa Crear cuenta otra vez."
          : "No pudimos enviar el correo de verificación. Intenta de nuevo en unos minutos.";
      throw new ErrorApi(503, detalle);
    }
    Map<String, Object> cuerpo = new LinkedHashMap<>();
    cuerpo.put("mensaje", mensaje);
    cuerpo.put("usuario", publico(fila));
    if (!enviado && demo) {
      cuerpo.put("codigoVerificacion", fila.getCodigoVerificacion());
    }
    return cuerpo;
  }

  private void guardarCodigo(Usuario fila) {
    int codigo = ThreadLocalRandom.current().nextInt(100000, 1000000);
    fila.setCodigoVerificacion(String.valueOf(codigo));
    fila.setCodigoExpira(Instant.now().plusSeconds(minutosCodigo * 60L));
  }

  private static String texto(Object valor) {
    return String.valueOf(valor == null ? "" : valor).trim();
  }

  private static String correo(Object valor) {
    return texto(valor).toLowerCase();
  }

  private static boolean correoValido(String correo) {
    return correo.contains("@") && correo.contains(".");
  }
}
