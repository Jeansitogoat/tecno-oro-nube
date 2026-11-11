package com.tecnooro.controlador;

import com.tecnooro.modelo.Usuario;
import com.tecnooro.servicio.CatalogoServicio;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoControlador {

  private final CatalogoServicio catalogo;

  public PedidoControlador(CatalogoServicio catalogo) {
    this.catalogo = catalogo;
  }

  @GetMapping
  public Map<String, Object> listar(@AuthenticationPrincipal Usuario usuario) {
    return Map.of("pedidos", catalogo.listarPedidos(usuario));
  }

  @GetMapping("/{id}")
  public Map<String, Object> uno(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
    return Map.of("pedido", catalogo.buscarPedido(id, usuario));
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public Map<String, Object> crear(
      @AuthenticationPrincipal Usuario usuario,
      @RequestBody(required = false) Map<String, Object> datos) {
    return catalogo.crearPedido(usuario, datos == null ? Map.of() : datos);
  }
}
