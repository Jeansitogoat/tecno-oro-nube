import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';
import { Usuario } from '../modelos';
import { AuthService, textoError } from '../servicios/auth.service';

@Component({
  selector: 'app-entrar',
  imports: [FormsModule],
  template: `
    <section class="acceso">
      <aside class="acceso-lado" [style.background-image]="'url(' + foto + ')'">
        <div class="acceso-contenido">
          <p class="ceja">Tecno Oro</p>
          <h1>Celulares, accesorios y servicio técnico en un solo lugar.</h1>
          <p>Revisa el catálogo, crea tu cuenta y sigue tus pedidos desde el local.</p>
          <ul>
            <li><span></span>Celulares</li>
            <li><span></span>Accesorios</li>
            <li><span></span>Servicios técnicos</li>
          </ul>
        </div>
      </aside>

      <div class="acceso-form">
        <div class="acceso-caja">
          <div class="acceso-cabeza">
            <img src="/logo-tecno-oro.jpg" alt="Tecno Oro" />
            <div>
              <strong>Tecno Oro</strong>
              <small>Celulares y más</small>
            </div>
          </div>

          @if (paso !== 'verificar') {
            <div class="pasos">
              <button type="button" [class.activo]="paso === 'entrar'" (click)="paso = 'entrar'">Iniciar sesión</button>
              <button type="button" [class.activo]="paso === 'registro'" (click)="paso = 'registro'">Registrarse</button>
            </div>
          }

          @if (paso === 'entrar') {
            <h2>Inicia sesión en tu cuenta</h2>
            <p class="muted">Accede a tus pedidos y gestiona tus compras.</p>
          }
          @if (paso === 'registro') {
            <h2>Crea tu cuenta</h2>
            <p class="muted">Te enviaremos un código a tu correo para activarla.</p>
          }
          @if (paso === 'verificar') {
            <h2>Verifica tu correo</h2>
            <p class="muted">Escribe el código de 6 dígitos que enviamos a {{ correo || 'tu correo' }}.</p>
          }
          @if (enviando && paso !== 'entrar') { <p class="aviso">Contactando a Gmail para enviar el código.</p> }
          @if (mensaje) { <p class="aviso" [class.error]="!ok" [class.ok]="ok">{{ mensaje }}</p> }

          @if (paso === 'entrar') {
            <form (ngSubmit)="alEntrar()">
              <label>Correo electrónico
                <span class="campo-caja">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 6h16v12H4z"/><path d="m4 7 8 6 8-6"/></svg>
                  <input name="correo" type="email" [(ngModel)]="correo" placeholder="correo@ejemplo.com" required />
                </span>
              </label>
              <label>Contraseña
                <span class="campo-caja">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
                  <input name="password" [type]="verClave ? 'text' : 'password'" [(ngModel)]="password" placeholder="Contraseña" required minlength="6" />
                  <button type="button" class="ojo" (click)="verClave = !verClave" [attr.aria-label]="verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/></svg>
                  </button>
                </span>
              </label>
              <button class="boton boton-ancho" type="submit" [disabled]="enviando">{{ enviando ? 'Entrando...' : 'Entrar' }}</button>
            </form>
            <p class="acceso-extra">¿No tienes cuenta? <button type="button" class="enlace" (click)="paso = 'registro'">Regístrate</button></p>
          }

          @if (paso === 'registro') {
            <form (ngSubmit)="alRegistrar()">
              <label>Nombre
                <span class="campo-caja">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="8" r="3"/><path d="M5 19c1.5-3 3.8-4.5 7-4.5S17.5 16 19 19"/></svg>
                  <input name="nombre" [(ngModel)]="nombre" placeholder="Tu nombre" required minlength="2" />
                </span>
              </label>
              <label>Correo electrónico
                <span class="campo-caja">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 6h16v12H4z"/><path d="m4 7 8 6 8-6"/></svg>
                  <input name="correo" type="email" [(ngModel)]="correo" placeholder="correo@ejemplo.com" required />
                </span>
              </label>
              <label>Contraseña
                <span class="campo-caja">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
                  <input name="password" type="password" [(ngModel)]="password" placeholder="Mínimo 6 caracteres" required minlength="6" />
                </span>
              </label>
              <button class="boton boton-ancho" type="submit" [disabled]="enviando">{{ enviando ? 'Enviando código...' : 'Crear cuenta' }}</button>
            </form>
            <p class="acceso-extra">¿Ya tienes cuenta? <button type="button" class="enlace" (click)="paso = 'entrar'">Inicia sesión</button></p>
          }

          @if (paso === 'verificar') {
            <form (ngSubmit)="alVerificar()">
              <label>Código
                <span class="campo-caja codigo-caja">
                  <input name="codigo" [(ngModel)]="codigoIngresado" inputmode="numeric" maxlength="6" placeholder="000000" required autocomplete="one-time-code" />
                </span>
              </label>
              <button class="boton boton-ancho" type="submit" [disabled]="enviando">{{ enviando ? 'Verificando...' : 'Verificar' }}</button>
            </form>
            <p class="acceso-extra">
              <button type="button" class="enlace" (click)="reenviar()">Pedir otro código</button>
              ·
              <button type="button" class="enlace" (click)="paso = 'entrar'">Volver a entrar</button>
            </p>
          }
        </div>
      </div>
    </section>
  `,
})
export class EntrarComponent {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  paso: 'entrar' | 'registro' | 'verificar' = 'entrar';
  nombre = '';
  correo = '';
  password = '';
  codigoIngresado = '';
  mensaje = '';
  ok = false;
  enviando = false;
  verClave = false;
  foto = environment.apiUrl.replace(/\/api\/?$/, '') + '/img/iphone.jpg';

  alEntrar(): void {
    this.enviando = true;
    this.http.post<{ token: string; usuario: Usuario }>(environment.apiUrl + '/auth/login', {
      correo: this.correo,
      password: this.password,
    }).subscribe({
      next: (cuerpo) => this.auth.entrar(cuerpo.token, cuerpo.usuario),
      error: (error) => {
        const texto = textoError(error);
        this.aviso(texto, false);
        if (texto.toLowerCase().includes('verificar')) this.paso = 'verificar';
        this.enviando = false;
      },
    });
  }

  alRegistrar(): void {
    this.enviando = true;
    this.http.post<{ mensaje: string; usuario: Usuario }>(
      environment.apiUrl + '/auth/registro',
      { nombre: this.nombre, correo: this.correo, password: this.password }
    ).subscribe({
      next: (cuerpo) => {
        this.aviso(cuerpo.mensaje, true);
        this.paso = 'verificar';
        this.enviando = false;
      },
      error: (error) => {
        this.aviso(textoError(error), false);
        this.enviando = false;
      },
    });
  }

  alVerificar(): void {
    this.enviando = true;
    this.http.post<{ mensaje: string }>(environment.apiUrl + '/auth/verificar', {
      correo: this.correo,
      codigo: this.codigoIngresado,
    }).subscribe({
      next: (cuerpo) => {
        this.aviso(cuerpo.mensaje, true);
        this.paso = 'entrar';
        this.enviando = false;
      },
      error: (error) => {
        this.aviso(textoError(error), false);
        this.enviando = false;
      },
    });
  }

  reenviar(): void {
    this.http.post<{ mensaje: string }>(environment.apiUrl + '/auth/reenviar-codigo', { correo: this.correo }).subscribe({
      next: (cuerpo) => this.aviso(cuerpo.mensaje, true),
      error: (error) => this.aviso(textoError(error), false),
    });
  }

  private aviso(texto: string, ok: boolean): void {
    this.mensaje = texto;
    this.ok = ok;
  }
}
