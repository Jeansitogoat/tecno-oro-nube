package com.tecnooro.repositorio;

import com.tecnooro.modelo.Pedido;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoRepositorio extends JpaRepository<Pedido, Long> {
  List<Pedido> findAllByOrderByIdAsc();
  List<Pedido> findByUsuarioIdOrderByIdAsc(Long usuarioId);
  long countByProductoId(Long productoId);
  void deleteByUsuarioId(Long usuarioId);
}
