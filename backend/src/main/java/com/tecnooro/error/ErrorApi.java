package com.tecnooro.error;

public class ErrorApi extends RuntimeException {

  private final int status;

  public ErrorApi(int status, String mensaje) {
    super(mensaje);
    this.status = status;
  }

  public int getStatus() {
    return status;
  }
}
