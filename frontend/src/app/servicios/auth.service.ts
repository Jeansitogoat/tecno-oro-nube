import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Usuario } from '../modelos';

const CLAVE = 'tecno-oro-token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly usuario = signal<Usuario | null>(null);
  readonly listo = signal(false);

  constructor(private http: HttpClient, private router: Router) {
    const token = this.token();
    if (!token) {
      this.listo.set(true);
      return;
    }
    this.http.get<{ usuario: Usuario }>(environment.apiUrl + '/auth/perfil').subscribe({
      next: (cuerpo) => {
        this.usuario.set(cuerpo.usuario);
        this.listo.set(true);
      },
      error: () => {
        this.salir(false);
        this.listo.set(true);
      },
    });
  }

  token(): string {
    return sessionStorage.getItem(CLAVE) || '';
  }

  entrar(token: string, usuario: Usuario): void {
    sessionStorage.setItem(CLAVE, token);
    this.usuario.set(usuario);
    this.listo.set(true);
    this.router.navigateByUrl(usuario.rol === 'ADMIN' ? '/admin' : '/tienda');
  }

  salir(redirigir = true): void {
    sessionStorage.removeItem(CLAVE);
    sessionStorage.removeItem('tecno-oro-carrito');
    this.usuario.set(null);
    if (redirigir) {
      this.router.navigateByUrl('/');
    }
  }
}

export function textoError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const cuerpo = error.error as { error?: string } | null;
    if (cuerpo && cuerpo.error) {
      return cuerpo.error;
    }
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Revisa apiUrl y que Spring Boot esté encendido.';
    }
  }
  return 'No se pudo completar la acción.';
}
