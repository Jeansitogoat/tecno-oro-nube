package com.tecnooro.repositorio;

import com.tecnooro.modelo.Usuario;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepositorio extends JpaRepository<Usuario, Long> {
  Optional<Usuario> findByCorreo(String correo);
}
