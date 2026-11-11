package com.tecnooro.modelo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "productos")
public class Producto {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String tipo;

  @Column(nullable = false)
  private String nombre;

  @Column(nullable = false)
  private String detalle;

  @Column(nullable = false)
  private double precio;

  @Column(nullable = false)
  private String imagen;

  public Long getId() { return id; }
  public String getTipo() { return tipo; }
  public void setTipo(String tipo) { this.tipo = tipo; }
  public String getNombre() { return nombre; }
  public void setNombre(String nombre) { this.nombre = nombre; }
  public String getDetalle() { return detalle; }
  public void setDetalle(String detalle) { this.detalle = detalle; }
  public double getPrecio() { return precio; }
  public void setPrecio(double precio) { this.precio = precio; }
  public String getImagen() { return imagen; }
  public void setImagen(String imagen) { this.imagen = imagen; }
}
