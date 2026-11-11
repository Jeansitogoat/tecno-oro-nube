package com.tecnooro.error;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ManejadorErrores {

  @ExceptionHandler(ErrorApi.class)
  public ResponseEntity<Map<String, String>> errorApi(ErrorApi error) {
    return ResponseEntity.status(error.getStatus()).body(Map.of("error", error.getMessage()));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<Map<String, String>> otro(Exception error) {
    error.printStackTrace();
    return ResponseEntity.status(500).body(Map.of("error", "Error interno"));
  }
}
