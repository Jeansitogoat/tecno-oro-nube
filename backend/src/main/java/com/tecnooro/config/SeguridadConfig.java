package com.tecnooro.config;

import com.tecnooro.seguridad.FiltroJwt;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SeguridadConfig {

  private final String origenes;

  public SeguridadConfig(@Value("${app.cors.origenes}") String origenes) {
    this.origenes = origenes;
  }

  @Bean
  SecurityFilterChain filtro(HttpSecurity http, FiltroJwt jwt) throws Exception {
    http
        .csrf(AbstractHttpConfigurer::disable)
        .cors(cors -> cors.configurationSource(cors()))
        .sessionManagement(sesion -> sesion.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
            .requestMatchers("/api/salud", "/img/**", "/logo-tecno-oro.jpg", "/h2/**").permitAll()
            .requestMatchers(HttpMethod.POST,
                "/api/auth/registro",
                "/api/auth/verificar",
                "/api/auth/reenviar-codigo",
                "/api/auth/login").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/productos", "/api/productos/**").permitAll()
            .requestMatchers("/api/admin/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.POST, "/api/pedidos").hasRole("USER")
            .anyRequest().authenticated())
        .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
        .addFilterBefore(jwt, UsernamePasswordAuthenticationFilter.class);
    return http.build();
  }

  @Bean
  CorsConfigurationSource cors() {
    CorsConfiguration configuracion = new CorsConfiguration();
    configuracion.setAllowedOriginPatterns(List.of(this.origenes.split("\\s*,\\s*")));
    configuracion.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    configuracion.setAllowedHeaders(List.of("*"));
    configuracion.setAllowCredentials(false);
    UrlBasedCorsConfigurationSource fuente = new UrlBasedCorsConfigurationSource();
    fuente.registerCorsConfiguration("/**", configuracion);
    return fuente;
  }

  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  UserDetailsService usuarios() {
    return correo -> {
      throw new UsernameNotFoundException(correo);
    };
  }

  @Bean
  AuthenticationManager authenticationManager(AuthenticationConfiguration configuracion) throws Exception {
    return configuracion.getAuthenticationManager();
  }
}
