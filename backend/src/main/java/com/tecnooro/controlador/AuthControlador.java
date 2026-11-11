package com.tecnooro.controlador;

import com.tecnooro.modelo.Usuario;
import com.tecnooro.servicio.UsuarioServicio;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthControlador {

  private final UsuarioServicio usuarios;

  public AuthControlador(UsuarioServicio usuarios) {
    this.usuarios = usuarios;
  }

  @PostMapping("/registro")
  @ResponseStatus(HttpStatus.CREATED)
  public Map<String, Object> registro(@RequestBody(required = false) Map<String, Object> datos) {
    return usuarios.registrar(datos == null ? Map.of() : datos);
  }

  @PostMapping("/verificar")
  public Map<String, Object> verificar(@RequestBody(required = false) Map<String, Object> datos) {
    return usuarios.verificar(datos == null ? Map.of() : datos);
  }

  @PostMapping("/reenviar-codigo")
  public Map<String, Object> reenviar(@RequestBody(required = false) Map<String, Object> datos) {
    return usuarios.reenviar(datos == null ? Map.of() : datos);
  }

  @PostMapping("/login")
  public Map<String, Object> login(@RequestBody(required = false) Map<String, Object> datos) {
    return usuarios.entrar(datos == null ? Map.of() : datos);
  }

  @GetMapping("/perfil")
  public Map<String, Object> perfil(@AuthenticationPrincipal Usuario usuario) {
    return Map.of("usuario", usuarios.publico(usuario));
  }

  @PatchMapping("/perfil")
  public Map<String, Object> actualizar(
      @AuthenticationPrincipal Usuario usuario,
      @RequestBody(required = false) Map<String, Object> datos) {
    return usuarios.actualizarPerfil(usuario, datos == null ? Map.of() : datos);
  }
}
