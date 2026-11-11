package com.tecnooro.servicio;

import jakarta.mail.Authenticator;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.MimeMessage;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.util.Properties;
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
  private final String clave;
  private final int minutos;
  private volatile boolean redBloqueada;

  public CorreoServicio(
      JavaMailSender mail,
      @Value("${GMAIL_REMITENTE:}") String remitente,
      @Value("${GMAIL_APP_PASSWORD:}") String clave,
      @Value("${app.minutos-codigo}") int minutos) {
    this.mail = mail;
    this.remitente = remitente;
    this.clave = clave;
    this.minutos = minutos;
  }

  public boolean redBloqueada() {
    return redBloqueada;
  }

  public boolean enviarCodigo(String destino, String codigo) {
    if (remitente == null || remitente.isBlank() || clave == null || clave.isBlank()) {
      log.error("Faltan GMAIL_REMITENTE o GMAIL_APP_PASSWORD");
      return false;
    }
    int puerto = puertoDisponible();
    if (puerto == 0) {
      redBloqueada = true;
      log.error("No hay salida hacia smtp.gmail.com en 587 ni en 465");
      return false;
    }
    redBloqueada = false;
    try {
      if (puerto == 465) {
        enviarPorSsl(destino, codigo);
      } else {
        MimeMessage mensaje = mail.createMimeMessage();
        preparar(mensaje, destino, codigo);
        mail.send(mensaje);
      }
      return true;
    } catch (Exception error) {
      log.error("SMTP Gmail no pudo usarse: {}", error.getMessage());
      return false;
    }
  }

  private void preparar(MimeMessage mensaje, String destino, String codigo) throws Exception {
    MimeMessageHelper helper = new MimeMessageHelper(mensaje, false, "UTF-8");
    helper.setFrom(remitente, "Tecno Oro");
    helper.setTo(destino);
    helper.setSubject("Código de verificación - Tecno Oro");
    helper.setText(
        "<p>Tu código para verificar la cuenta es <strong>" + codigo + "</strong>.</p>"
            + "<p>Caduca en " + minutos + " minutos.</p>",
        true);
  }

  private void enviarPorSsl(String destino, String codigo) throws Exception {
    Properties props = new Properties();
    props.put("mail.smtp.host", "smtp.gmail.com");
    props.put("mail.smtp.port", "465");
    props.put("mail.smtp.auth", "true");
    props.put("mail.smtp.ssl.enable", "true");
    props.put("mail.smtp.connectiontimeout", "8000");
    props.put("mail.smtp.timeout", "8000");
    props.put("mail.smtp.writetimeout", "8000");
    Session sesion = Session.getInstance(props, new Authenticator() {
      @Override
      protected PasswordAuthentication getPasswordAuthentication() {
        return new PasswordAuthentication(remitente, clave);
      }
    });
    MimeMessage mensaje = new MimeMessage(sesion);
    preparar(mensaje, destino, codigo);
    Transport.send(mensaje);
  }

  private int puertoDisponible() {
    if (conecta(587)) {
      return 587;
    }
    if (conecta(465)) {
      return 465;
    }
    return 0;
  }

  private boolean conecta(int puerto) {
    try (Socket socket = new Socket()) {
      socket.connect(new InetSocketAddress("smtp.gmail.com", puerto), 8000);
      return true;
    } catch (Exception error) {
      log.error("smtp.gmail.com:{} {}", puerto, error.toString());
      return false;
    }
  }
}
