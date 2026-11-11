package com.tecnooro.modelo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "usuarios")
public class Usuario {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String nombre;

  @Column(nullable = false, unique = true)
  private String correo;

  @Column(name = "password_hash", nullable = false)
  private String passwordHash;

  @Column(nullable = false)
  private String rol;

  @Column(nullable = false)
  private String estado;

  @Column(nullable = false)
  private boolean verificado;

  @Column(name = "codigo_verificacion")
  private String codigoVerificacion;

  @Column(name = "codigo_expira")
  private Instant codigoExpira;

  @Column(name = "creado_en", nullable = false)
  private Instant creadoEn;

  public Long getId() { return id; }
  public String getNombre() { return nombre; }
  public void setNombre(String nombre) { this.nombre = nombre; }
  public String getCorreo() { return correo; }
  public void setCorreo(String correo) { this.correo = correo; }
  public String getPasswordHash() { return passwordHash; }
  public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
  public String getRol() { return rol; }
  public void setRol(String rol) { this.rol = rol; }
  public String getEstado() { return estado; }
  public void setEstado(String estado) { this.estado = estado; }
  public boolean isVerificado() { return verificado; }
  public void setVerificado(boolean verificado) { this.verificado = verificado; }
  public String getCodigoVerificacion() { return codigoVerificacion; }
  public void setCodigoVerificacion(String codigoVerificacion) { this.codigoVerificacion = codigoVerificacion; }
  public Instant getCodigoExpira() { return codigoExpira; }
  public void setCodigoExpira(Instant codigoExpira) { this.codigoExpira = codigoExpira; }
  public Instant getCreadoEn() { return creadoEn; }
  public void setCreadoEn(Instant creadoEn) { this.creadoEn = creadoEn; }
}
