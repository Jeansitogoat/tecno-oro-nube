package com.tecnooro.repositorio;

import com.tecnooro.modelo.Producto;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepositorio extends JpaRepository<Producto, Long> {
  Optional<Producto> findByTipoAndNombre(String tipo, String nombre);
}
