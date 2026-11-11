import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../servicios/auth.service';
import { PreferenciasService } from '../servicios/preferencias.service';

@Component({
  selector: 'app-cabecera',
  imports: [RouterLink, RouterLinkActive],
  template: `
    @if (!enAcceso()) {
    <header class="topbar">
      <a class="saltar" href="#contenido">{{ p.t('saltar') }}</a>
      <div class="contenedor topbar-fila">
        <a class="marca" [routerLink]="inicio()">
          <img src="/logo-tecno-oro.jpg" alt="" />
          <span class="marca-texto"><strong>Tecno Oro</strong><small>Celulares y más</small></span>
        </a>
        <button type="button" class="hamburguesa" [attr.aria-expanded]="menu()" [attr.aria-label]="menu() ? p.t('menuCerrar') : p.t('menuAbrir')" (click)="menu.set(!menu())">
          <span></span><span></span><span></span>
        </button>
        <nav [class.abierto]="menu()" [attr.aria-label]="p.t('menu')">
          @if (!auth.usuario()) {
            <a routerLink="/" routerLinkActive="activo" [routerLinkActiveOptions]="{ exact: true }" (click)="menu.set(false)">{{ p.t('inicio') }}</a>
            <a href="/#catalogo" (click)="menu.set(false)">{{ p.t('navCatalogo') }}</a>
            <a href="/#servicios" (click)="menu.set(false)">{{ p.t('servicios') }}</a>
            <a href="/#nosotros" (click)="menu.set(false)">{{ p.t('navNosotros') }}</a>
            <a href="/#contacto" (click)="menu.set(false)">{{ p.t('navContacto') }}</a>
            <a class="pastilla" routerLink="/entrar" (click)="menu.set(false)">{{ p.t('entrarCorreo') }}</a>
          }
          @if (auth.usuario()?.rol === 'USER') {
            <a routerLink="/" (click)="menu.set(false)">{{ p.t('inicio') }}</a>
            <a routerLink="/tienda" routerLinkActive="activo" (click)="menu.set(false)">{{ p.t('panel') }}</a>
            <a href="/tienda#pedidos" (click)="menu.set(false)">{{ p.t('pedidos') }}</a>
            <a routerLink="/cuenta" routerLinkActive="activo" (click)="menu.set(false)">{{ p.t('perfil') }}</a>
            <span class="usuario-chip">{{ auth.usuario()?.correo }}</span>
            <button type="button" class="salir" (click)="auth.salir()">{{ p.t('salir') }}</button>
          }
          @if (auth.usuario()?.rol === 'ADMIN') {
            <a routerLink="/admin" routerLinkActive="activo" (click)="menu.set(false)">{{ p.t('admin') }}</a>
            <button type="button" class="salir" (click)="auth.salir()">{{ p.t('salir') }}</button>
          }
        </nav>
      </div>
    </header>
    }
  `,
})
export class CabeceraComponent {
  auth = inject(AuthService);
  p = inject(PreferenciasService);
  private router = inject(Router);
  menu = signal(false);

  enAcceso(): boolean {
    return this.router.url.startsWith('/entrar');
  }

  inicio(): string {
    const usuario = this.auth.usuario();
    if (!usuario) return '/';
    return usuario.rol === 'ADMIN' ? '/admin' : '/tienda';
  }
}
