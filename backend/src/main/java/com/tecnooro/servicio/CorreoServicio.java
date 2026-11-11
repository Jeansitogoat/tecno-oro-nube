package com.tecnooro.servicio;

import jakarta.mail.internet.MimeMessage;
import java.net.InetSocketAddress;
import java.net.Socket;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class CorreoServicio {

  private static final Logger log = LoggerFactory.getLogger(CorreoServicio.class);

  private final JavaMailSender mail;
  private final String remitente;
  private final int minutos;
  private volatile boolean redBloqueada;

  public CorreoServicio(
      JavaMailSender mail,
      @Value("${GMAIL_REMITENTE:}") String remitente,
      @Value("${app.minutos-codigo}") int minutos) {
    this.mail = mail;
    this.remitente = remitente;
    this.minutos = minutos;
  }

  public boolean redBloqueada() {
    return redBloqueada;
  }

  public boolean enviarCodigo(String destino, String codigo) {
    if (remitente == null || remitente.isBlank()) {
      log.error("No hay GMAIL_REMITENTE en config/correo.local.properties");
      return false;
    }
    if (!puertoCorreoAbierto()) {
      redBloqueada = true;
      log.error("Esta red no deja conectar con smtp.gmail.com:587");
      return false;
    }
    redBloqueada = false;
    try {
      MimeMessage mensaje = mail.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(mensaje, false, "UTF-8");
      helper.setFrom(remitente, "Tecno Oro");
      helper.setTo(destino);
      helper.setSubject("Código de verificación - Tecno Oro");
      helper.setText(
          "<p>Tu código para verificar la cuenta es <strong>" + codigo + "</strong>.</p>"
              + "<p>Caduca en " + minutos + " minutos.</p>",
          true);
      mail.send(mensaje);
      return true;
    } catch (Exception error) {
      log.error("SMTP Gmail no pudo usarse: {}", error.getMessage());
      return false;
    }
  }

  private boolean puertoCorreoAbierto() {
    try (Socket socket = new Socket()) {
      socket.connect(new InetSocketAddress("smtp.gmail.com", 587), 2500);
      return true;
    } catch (Exception error) {
      return false;
    }
  }
}
