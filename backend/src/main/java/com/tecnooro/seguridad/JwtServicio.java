package com.tecnooro.seguridad;

import com.tecnooro.error.ErrorApi;
import com.tecnooro.modelo.Usuario;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtServicio {

  private final SecretKey clave;
  private final long horas;

  public JwtServicio(
      @Value("${app.jwt.secreto}") String secreto,
      @Value("${app.jwt.expira-horas}") long horas) {
    this.clave = Keys.hmacShaKeyFor(secreto.getBytes(StandardCharsets.UTF_8));
    this.horas = horas;
  }

  public String firmar(Usuario usuario) {
    Instant ahora = Instant.now();
    return Jwts.builder()
        .subject(String.valueOf(usuario.getId()))
        .claim("id", usuario.getId())
        .claim("correo", usuario.getCorreo())
        .claim("rol", usuario.getRol())
        .issuedAt(Date.from(ahora))
        .expiration(Date.from(ahora.plusSeconds(horas * 3600)))
        .signWith(clave)
        .compact();
  }

  public Long leerId(String token) {
    try {
      Object id = Jwts.parser()
          .verifyWith(clave)
          .build()
          .parseSignedClaims(token)
          .getPayload()
          .get("id");
      if (id instanceof Number numero) {
        return numero.longValue();
      }
      return Long.valueOf(String.valueOf(id));
    } catch (RuntimeException error) {
      throw new ErrorApi(401, "Tu sesión expiró. Entra otra vez.");
    }
  }
}
