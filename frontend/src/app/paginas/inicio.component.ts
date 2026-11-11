import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Producto } from '../modelos';
import { AuthService } from '../servicios/auth.service';
import { CatalogoService } from '../servicios/catalogo.service';
import { dinero, rutaImagen } from '../servicios/formato';
import { PreferenciasService } from '../servicios/preferencias.service';

@Component({
  selector: 'app-inicio',
  imports: [FormsModule],
  template: `
    <section class="hero-lienzo">
      <div class="contenedor hero">
        <div>
          <p class="ceja">{{ p.t('ceja') }}</p>
          <h1>{{ p.t('heroTitulo') }}</h1>
          <p class="hero-texto">{{ p.t('heroNuevo') }}</p>
          <div class="hero-acciones">
            <a class="boton" href="#catalogo">{{ p.t('verCatalogo') }}</a>
            <a class="boton boton-linea" href="#servicios">{{ p.t('nuestrosServicios') }}</a>
          </div>
        </div>
        <div class="hero-visual">
          <img class="hero-foto" [src]="fotoRuta('img/iphone.jpg')" alt="Celular del catálogo" />
        </div>
      </div>
    </section>

    <section class="beneficios contenedor">
      <article><span class="icono" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg></span><div><strong>{{ p.t('ben1') }}</strong><span>{{ p.t('ben1t') }}</span></div></article>
      <article><span class="icono" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3 5 6v6c0 4.2 2.8 6.8 7 8 4.2-1.2 7-3.8 7-8V6z"/></svg></span><div><strong>{{ p.t('ben2') }}</strong><span>{{ p.t('ben2t') }}</span></div></article>
      <article><span class="icono" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14.5 6.5 17.5 9.5 8 19H5v-3z"/><path d="m13 8 3 3"/></svg></span><div><strong>{{ p.t('ben3') }}</strong><span>{{ p.t('ben3t') }}</span></div></article>
      <article><span class="icono" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg></span><div><strong>{{ p.t('ben4') }}</strong><span>{{ p.t('ben4t') }}</span></div></article>
    </section>

    <section class="bloque" id="catalogo">
      <div class="contenedor">
        <div class="seccion-cabecera">
          <div>
            <h2>{{ p.t('explora') }}</h2>
            <p>{{ p.t('exploraNota') }}</p>
          </div>
          <a href="#destacados">{{ p.t('verCatalogo') }}</a>
        </div>
        <div class="categorias" id="servicios">
          <a href="#destacados" (click)="tipo = 'servicio'">
            <img [src]="fotoRuta('img/vidrio.jpg')" alt="" />
            <div><strong>{{ p.t('servicios') }}</strong><span>{{ p.t('catServicios') }}</span></div>
          </a>
          <a href="#destacados" (click)="tipo = 'celular'">
            <img [src]="fotoRuta('img/samsung.jpg')" alt="" />
            <div><strong>{{ p.t('celulares') }}</strong><span>{{ p.t('catCelulares') }}</span></div>
          </a>
          <a href="#destacados" (click)="tipo = 'accesorio'">
            <img [src]="fotoRuta('img/audifonos.jpg')" alt="" />
            <div><strong>{{ p.t('accesorios') }}</strong><span>{{ p.t('catAccesorios') }}</span></div>
          </a>
        </div>

        <div class="seccion-cabecera" id="destacados">
          <h2>{{ p.t('destacados') }}</h2>
        </div>
        <div class="filtros">
          <input [(ngModel)]="busqueda" [placeholder]="p.t('buscarPh')" [attr.aria-label]="p.t('buscar')" />
          <button type="button" [class.activo]="tipo === 'todo'" (click)="tipo = 'todo'">{{ p.t('todo') }}</button>
          <button type="button" [class.activo]="tipo === 'servicio'" (click)="tipo = 'servicio'">{{ p.t('servicios') }}</button>
          <button type="button" [class.activo]="tipo === 'celular'" (click)="tipo = 'celular'">{{ p.t('celulares') }}</button>
          <button type="button" [class.activo]="tipo === 'accesorio'" (click)="tipo = 'accesorio'">{{ p.t('accesorios') }}</button>
        </div>
        @if (error) { <p class="aviso error">{{ error }}</p> }
        <div class="rejilla">
          @for (producto of visibles(); track producto.id) {
            <article class="tarjeta">
              <img [src]="foto(producto)" [alt]="producto.nombre" />
              <p class="sobre">{{ p.t(producto.tipo) }}</p>
              <h3>{{ producto.nombre }}</h3>
              <div class="tarjeta-pie">
                <div>
                  <strong>{{ precio(producto.precio) }}</strong>
                  <small>{{ producto.detalle }}</small>
                </div>
                <button type="button" class="carrito-btn" (click)="elegir(producto)" [attr.aria-label]="p.t('elegir')">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 7h15l-1.5 9h-12z"/><path d="M6 7 5 4H2"/><circle cx="9" cy="20" r="1.3"/><circle cx="18" cy="20" r="1.3"/></svg>
                </button>
              </div>
            </article>
          }
        </div>
      </div>
    </section>

    <section class="bloque nosotros" id="nosotros">
      <div class="contenedor">
        <h2>{{ p.t('navNosotros') }}</h2>
        <p>{{ p.t('pie') }}</p>
      </div>
    </section>
    <footer class="pie" id="contacto">
      <div class="contenedor">{{ p.t('pie') }}</div>
    </footer>
  `,
})
export class InicioComponent implements OnInit {
  p = inject(PreferenciasService);
  private catalogo = inject(CatalogoService);
  private auth = inject(AuthService);
  private router = inject(Router);
  productos: Producto[] = [];
  busqueda = '';
  tipo = 'todo';
  error = '';

  ngOnInit(): void {
    this.catalogo.productos().subscribe({
      next: (cuerpo) => (this.productos = cuerpo.productos),
      error: () => (this.error = this.p.t('sinProductos')),
    });
  }

  visibles(): Producto[] {
    const texto = this.busqueda.trim().toLowerCase();
    return this.productos.filter((producto) => {
      if (this.tipo !== 'todo' && producto.tipo !== this.tipo) return false;
      if (!texto) return true;
      return (producto.nombre + ' ' + producto.detalle).toLowerCase().includes(texto);
    });
  }

  foto(producto: Producto): string { return rutaImagen(producto.imagen); }
  fotoRuta(ruta: string): string { return rutaImagen(ruta); }
  precio(valor: number): string { return dinero(valor); }

  elegir(producto: Producto): void {
    sessionStorage.setItem('tecno-oro-pendiente-id', String(producto.id));
    if (this.auth.usuario()?.rol === 'USER') {
      this.router.navigateByUrl('/tienda');
      return;
    }
    this.router.navigateByUrl('/entrar');
  }
}
