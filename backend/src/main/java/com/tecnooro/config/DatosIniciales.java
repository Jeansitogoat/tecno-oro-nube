package com.tecnooro.config;

import com.tecnooro.modelo.Producto;
import com.tecnooro.modelo.Usuario;
import com.tecnooro.repositorio.ProductoRepositorio;
import com.tecnooro.repositorio.UsuarioRepositorio;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatosIniciales implements CommandLineRunner {

  private final ProductoRepositorio productos;
  private final UsuarioRepositorio usuarios;
  private final PasswordEncoder encoder;
  private final String adminCorreo;
  private final String adminPassword;
  private final String adminNombre;

  public DatosIniciales(
      ProductoRepositorio productos,
      UsuarioRepositorio usuarios,
      PasswordEncoder encoder,
      @Value("${app.admin.correo}") String adminCorreo,
      @Value("${app.admin.password}") String adminPassword,
      @Value("${app.admin.nombre}") String adminNombre) {
    this.productos = productos;
    this.usuarios = usuarios;
    this.encoder = encoder;
    this.adminCorreo = adminCorreo;
    this.adminPassword = adminPassword;
    this.adminNombre = adminNombre;
  }

  @Override
  public void run(String... args) {
    if (productos.count() == 0) {
      celular("Samsung", "Galaxy S21 Ultra", 380, "img/samsung.jpg");
      celular("Xiaomi", "Redmi", 220, "img/xiaomi.jpg");
      celular("Apple", "iPhone", 350, "img/iphone.jpg");
      celular("Apple", "iPhone con funda", 370, "img/iphone-funda.jpg");
      accesorio("Funda", "Protege el equipo de golpes y rayones.", 8, "img/funda.jpg");
      accesorio("Cargador", "Cargador y cable para el día a día.", 12, "img/cargador.jpg");
      accesorio("Audífonos", "Earbuds para música y llamadas.", 18, "img/audifonos.jpg");
    }
    servicio("Diagnóstico", "Revisión del equipo antes de reparar.", 10, "img/local.jpg");
    servicio("Cambio de pantalla", "Pantalla nueva, según el modelo.", 45, "img/vidrio.jpg");
    servicio("Cambio de batería", "Batería de reemplazo en el local.", 25, "img/cargador.jpg");
    admin();
    cliente("María Paredes", "maria.paredes@correo.com");
    cliente("Luis Andrade", "luis.andrade@correo.com");
    cliente("Ana Torres", "ana.torres@correo.com");
  }

  private void celular(String marca, String modelo, double precio, String imagen) {
    guardar("celular", marca + " " + modelo, marca, precio, imagen);
  }

  private void accesorio(String nombre, String detalle, double precio, String imagen) {
    guardar("accesorio", nombre, detalle, precio, imagen);
  }

  private void servicio(String nombre, String detalle, double precio, String imagen) {
    if (productos.findByTipoAndNombre("servicio", nombre).isPresent()) {
      return;
    }
    guardar("servicio", nombre, detalle, precio, imagen);
  }

  private void guardar(String tipo, String nombre, String detalle, double precio, String imagen) {
    Producto producto = new Producto();
    producto.setTipo(tipo);
    producto.setNombre(nombre);
    producto.setDetalle(detalle);
    producto.setPrecio(precio);
    producto.setImagen(imagen);
    productos.save(producto);
  }

  private void admin() {
    if (usuarios.findByCorreo(adminCorreo).isPresent()) {
      return;
    }
    Usuario admin = new Usuario();
    admin.setNombre(adminNombre);
    admin.setCorreo(adminCorreo);
    admin.setPasswordHash(encoder.encode(adminPassword));
    admin.setRol("ADMIN");
    admin.setEstado("APROBADA");
    admin.setVerificado(true);
    admin.setCreadoEn(Instant.now());
    usuarios.save(admin);
  }

  private void cliente(String nombre, String correo) {
    if (usuarios.findByCorreo(correo).isPresent()) {
      return;
    }
    Usuario cliente = new Usuario();
    cliente.setNombre(nombre);
    cliente.setCorreo(correo);
    cliente.setPasswordHash(encoder.encode("cliente123"));
    cliente.setRol("USER");
    cliente.setEstado("APROBADA");
    cliente.setVerificado(true);
    cliente.setCreadoEn(Instant.now());
    usuarios.save(cliente);
  }
}
