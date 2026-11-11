import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LineaCarrito, Pedido, Producto } from '../modelos';
import { AuthService, textoError } from '../servicios/auth.service';
import { CatalogoService } from '../servicios/catalogo.service';
import { dinero, fecha, rutaImagen, total } from '../servicios/formato';
import { PreferenciasService } from '../servicios/preferencias.service';

const CLAVE = 'tecno-oro-carrito';

@Component({
  selector: 'app-tienda',
  imports: [FormsModule],
  template: `
    <section class="bloque">
      <div class="contenedor tienda-pagina">
        <div class="tienda">
          <div>
            <p class="ceja">{{ p.t('panel') }}</p>
            <h1>{{ p.t('catalogo') }}</h1>
            <p class="muted">{{ p.t('hola', { nombre: auth.usuario()?.nombre || '' }) }}</p>
            @if (mensaje) { <p class="aviso" [class.ok]="ok" [class.error]="!ok">{{ mensaje }}</p> }
            @if (error) { <p class="aviso error">{{ error }}</p> }
            <div class="categorias">
              <a href="#catalogo-lista" (click)="tipo = 'servicio'"><img [src]="fotoRuta('img/vidrio.jpg')" alt="" /><div><strong>{{ p.t('servicios') }}</strong><span>{{ p.t('catServicios') }}</span></div></a>
              <a href="#catalogo-lista" (click)="tipo = 'celular'"><img [src]="fotoRuta('img/samsung.jpg')" alt="" /><div><strong>{{ p.t('celulares') }}</strong><span>{{ p.t('catCelulares') }}</span></div></a>
              <a href="#catalogo-lista" (click)="tipo = 'accesorio'"><img [src]="fotoRuta('img/audifonos.jpg')" alt="" /><div><strong>{{ p.t('accesorios') }}</strong><span>{{ p.t('catAccesorios') }}</span></div></a>
            </div>
            <div class="filtros" id="catalogo-lista">
              <input [(ngModel)]="busqueda" [placeholder]="p.t('buscarPh')" [attr.aria-label]="p.t('buscar')" />
              <button type="button" [class.activo]="tipo === 'todo'" (click)="tipo = 'todo'">{{ p.t('todo') }}</button>
              <button type="button" [class.activo]="tipo === 'servicio'" (click)="tipo = 'servicio'">{{ p.t('servicios') }}</button>
              <button type="button" [class.activo]="tipo === 'celular'" (click)="tipo = 'celular'">{{ p.t('celulares') }}</button>
              <button type="button" [class.activo]="tipo === 'accesorio'" (click)="tipo = 'accesorio'">{{ p.t('accesorios') }}</button>
            </div>
            <div class="rejilla">
              @for (producto of visibles(); track producto.id) {
                <article class="tarjeta">
                  <img [src]="foto(producto)" [alt]="producto.nombre" />
                  <p class="sobre">{{ p.t(producto.tipo) }}</p>
                  <h3>{{ producto.nombre }}</h3>
                  <div class="tarjeta-pie">
                    <div><strong>{{ precio(producto.precio) }}</strong><small>{{ producto.detalle }}</small></div>
                    <button type="button" class="carrito-btn" (click)="agregar(producto)" [attr.aria-label]="p.t('elegir')">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 7h15l-1.5 9h-12z"/><path d="M6 7 5 4H2"/><circle cx="9" cy="20" r="1.3"/><circle cx="18" cy="20" r="1.3"/></svg>
                    </button>
                  </div>
                </article>
              }
            </div>
          </div>
          <aside class="panel">
            <h2>{{ p.t('carrito', { n: unidades() }) }}</h2>
            @if (!lineas.length) { <p class="muted">{{ p.t('carritoVacio') }}</p> }
            @for (linea of lineas; track linea.productoId) {
              <div class="linea-carrito">
                <strong>{{ linea.nombre }}</strong>
                <span>{{ precio(linea.precio) }}</span>
                <div class="cantidad">
                  <button type="button" (click)="cambiar(linea.productoId, -1)" [attr.aria-label]="p.t('menos', { nombre: linea.nombre })">−</button>
                  <span>{{ linea.cantidad }}</span>
                  <button type="button" (click)="cambiar(linea.productoId, 1)" [attr.aria-label]="p.t('mas', { nombre: linea.nombre })">+</button>
                </div>
              </div>
            }
            <p class="subtotal"><span>{{ p.t('totalEtiqueta') }}</span><strong>{{ precio(subtotal()) }}</strong></p>
            <button type="button" class="boton boton-ancho" [disabled]="enviando || !lineas.length" (click)="confirmar()">
              {{ enviando ? p.t('registrando') : p.t('confirmar') }}
            </button>
          </aside>
        </div>

        <section>
          <div class="seccion-cabecera"><h2 id="pedidos">{{ p.t('pedidos') }}</h2></div>
          <div class="tabla-envoltorio">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>{{ p.t('productoCol') }}</th><th>{{ p.t('cant') }}</th><th>{{ p.t('totalEtiqueta') }}</th><th>{{ p.t('fecha') }}</th><th>{{ p.t('estado') }}</th>
                </tr>
              </thead>
              <tbody>
                @for (pedido of pedidos; track pedido.id) {
                  <tr>
                    <td>{{ pedido.id }}</td>
                    <td>{{ pedido.producto }}</td>
                    <td>{{ pedido.cantidad }}</td>
                    <td>{{ suma(pedido) }}</td>
                    <td>{{ cuando(pedido.creadoEn) }}</td>
                    <td><span class="chip" [class.listo]="pedido.estado === 'LISTO_ENTREGA'" [class.warn]="pedido.estado !== 'LISTO_ENTREGA'">{{ etiqueta(pedido.estado) }}</span></td>
                  </tr>
                } @empty {
                  <tr><td colspan="6">{{ p.t('sinPedidos') }}</td></tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  `,
})
export class TiendaComponent implements OnInit {
  auth = inject(AuthService);
  p = inject(PreferenciasService);
  private catalogo = inject(CatalogoService);
  productos: Producto[] = [];
  pedidos: Pedido[] = [];
  lineas: LineaCarrito[] = this.leer();
  busqueda = '';
  tipo = 'todo';
  error = '';
  mensaje = '';
  ok = true;
  enviando = false;

  ngOnInit(): void {
    this.catalogo.productos().subscribe({
      next: (cuerpo) => {
        this.productos = cuerpo.productos;
        const pendiente = Number(sessionStorage.getItem('tecno-oro-pendiente-id') || '');
        sessionStorage.removeItem('tecno-oro-pendiente-id');
        const elegido = this.productos.find((item) => item.id === pendiente);
        if (elegido) this.agregar(elegido);
      },
      error: () => (this.error = 'No se pudo cargar el catálogo.'),
    });
    this.cargarPedidos();
  }

  agregar(producto: Producto): void {
    const linea = this.lineas.find((item) => item.productoId === producto.id);
    if (linea) linea.cantidad += 1;
    else this.lineas.push({ productoId: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: 1 });
    this.guardar();
    this.aviso(producto.nombre + ' quedó en el carrito.', true);
  }

  cambiar(productoId: number, delta: number): void {
    this.lineas = this.lineas.flatMap((linea) => {
      if (linea.productoId !== productoId) return [linea];
      const cantidad = linea.cantidad + delta;
      return cantidad > 0 ? [{ ...linea, cantidad }] : [];
    });
    this.guardar();
  }

  confirmar(): void {
    if (!this.lineas.length) {
      this.aviso('El carrito está vacío.', false);
      return;
    }
    this.enviando = true;
    const pendientes = [...this.lineas];
    const siguiente = (): void => {
      const actual = pendientes.shift();
      if (!actual) {
        this.enviando = false;
        this.aviso('Pedido registrado.', true);
        this.cargarPedidos();
        return;
      }
      this.catalogo.crearPedido(actual.productoId, actual.cantidad).subscribe({
        next: () => {
          this.lineas = this.lineas.filter((linea) => linea.productoId !== actual.productoId);
          this.guardar();
          siguiente();
        },
        error: (error) => {
          this.enviando = false;
          this.aviso(textoError(error), false);
        },
      });
    };
    siguiente();
  }

  visibles(): Producto[] {
    const texto = this.busqueda.trim().toLowerCase();
    return this.productos.filter((producto) => {
      if (this.tipo !== 'todo' && producto.tipo !== this.tipo) return false;
      if (!texto) return true;
      return (producto.nombre + ' ' + producto.detalle).toLowerCase().includes(texto);
    });
  }

  unidades(): number {
    return this.lineas.reduce((suma, linea) => suma + linea.cantidad, 0);
  }

  subtotal(): number {
    return this.lineas.reduce((suma, linea) => suma + linea.precio * linea.cantidad, 0);
  }

  foto(producto: Producto): string { return rutaImagen(producto.imagen); }
  fotoRuta(ruta: string): string { return rutaImagen(ruta); }
  precio(valor: number): string { return dinero(valor); }
  suma(pedido: Pedido): string { return total(pedido.precio, pedido.cantidad); }
  cuando(iso: string): string { return fecha(iso); }
  etiqueta(estado: string): string {
    return estado === 'LISTO_ENTREGA' ? this.p.t('listoEntrega') : this.p.t('enPreparacion');
  }

  private cargarPedidos(): void {
    this.catalogo.pedidos().subscribe({
      next: (cuerpo) => (this.pedidos = cuerpo.pedidos),
      error: (error) => (this.error = textoError(error)),
    });
  }

  private leer(): LineaCarrito[] {
    try {
      const datos = JSON.parse(sessionStorage.getItem(CLAVE) || '[]') as LineaCarrito[];
      return Array.isArray(datos) ? datos : [];
    } catch {
      return [];
    }
  }

  private guardar(): void {
    this.lineas = [...this.lineas];
    sessionStorage.setItem(CLAVE, JSON.stringify(this.lineas));
  }

  private aviso(texto: string, ok: boolean): void {
    this.mensaje = texto;
    this.ok = ok;
  }
}
