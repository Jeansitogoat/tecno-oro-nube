package com.tecnooro.seguridad;

import com.tecnooro.error.ErrorApi;
import com.tecnooro.modelo.Usuario;
import com.tecnooro.repositorio.UsuarioRepositorio;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class FiltroJwt extends OncePerRequestFilter {

  private final JwtServicio jwt;
  private final UsuarioRepositorio usuarios;

  public FiltroJwt(JwtServicio jwt, UsuarioRepositorio usuarios) {
    this.jwt = jwt;
    this.usuarios = usuarios;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {
    String encabezado = request.getHeader(HttpHeaders.AUTHORIZATION);
    if (encabezado == null || !encabezado.startsWith("Bearer ")) {
      chain.doFilter(request, response);
      return;
    }

    try {
      Usuario usuario = usuarios.findById(jwt.leerId(encabezado.substring(7)))
          .orElseThrow(() -> new ErrorApi(401, "Tu sesión ya no es válida. Entra otra vez."));
      if ("USER".equals(usuario.getRol())) {
        exigirClienteActivo(usuario);
      }
      UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
          usuario,
          null,
          List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getRol())));
      SecurityContextHolder.getContext().setAuthentication(auth);
      chain.doFilter(request, response);
    } catch (ErrorApi error) {
      responder(response, error.getStatus(), error.getMessage());
    } catch (RuntimeException error) {
      responder(response, 401, "Tu sesión expiró. Entra otra vez.");
    }
  }

  public static void exigirClienteActivo(Usuario usuario) {
    if (!usuario.isVerificado()) {
      throw new ErrorApi(403, "Primero verifica tu correo con el código.");
    }
    if (!"APROBADA".equals(usuario.getEstado())) {
      throw new ErrorApi(403, motivo(usuario.getEstado()));
    }
  }

  private static String motivo(String estado) {
    if ("PENDIENTE".equals(estado)) {
      return "Tu cuenta todavía no está aprobada. Espera a que el local la active.";
    }
    if ("RECHAZADA".equals(estado)) {
      return "Tu cuenta fue rechazada. Habla con el local si fue un error.";
    }
    if ("BLOQUEADA".equals(estado)) {
      return "Tu cuenta está bloqueada.";
    }
    return "No puedes entrar con esta cuenta.";
  }

  private void responder(HttpServletResponse response, int status, String mensaje) throws IOException {
    response.setStatus(status);
    response.setContentType("application/json;charset=UTF-8");
    String seguro = mensaje.replace("\\", "\\\\").replace("\"", "\\\"");
    response.getWriter().write("{\"error\":\"" + seguro + "\"}");
  }
}
