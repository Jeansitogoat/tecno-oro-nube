package com.tecnooro.controlador;

import com.tecnooro.modelo.Producto;
import com.tecnooro.servicio.CatalogoServicio;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/productos")
public class ProductoControlador {

  private final CatalogoServicio catalogo;

  public ProductoControlador(CatalogoServicio catalogo) {
    this.catalogo = catalogo;
  }

  @GetMapping
  public Map<String, Object> listar() {
    return Map.of("productos", catalogo.listarProductos());
  }

  @GetMapping("/{id}")
  public Map<String, Producto> uno(@PathVariable Long id) {
    return Map.of("producto", catalogo.buscarProducto(id));
  }
}
