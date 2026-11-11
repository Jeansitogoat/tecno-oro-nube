package com.tecnooro.controlador;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SaludControlador {

  @GetMapping("/api/salud")
  public Map<String, Object> salud() {
    return Map.of("ok", true, "servicio", "Tecno Oro");
  }
}
