import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Pedido, Producto, Usuario } from '../modelos';
import { AdminService, ProductoFormulario } from '../servicios/admin.service';
import { CatalogoService } from '../servicios/catalogo.service';
import { textoError } from '../servicios/auth.service';
import { PreferenciasService } from '../servicios/preferencias.service';
import { dinero, fecha, rutaImagen, total } from '../servicios/formato';

@Component({
  selector: 'app-admin',
  imports: [FormsModule],
  template: `
    <section class="bloque">
      <div class="contenedor panel-admin">
        <aside class="lado">
          <p class="ceja">{{ p.t('admin') }}</p>
          <button type="button" [class.activo]="seccion === 'resumen'" (click)="ir('resumen')">{{ p.t('resumen') }}</button>
          <button type="button" [class.activo]="seccion === 'productos'" (click)="ir('productos')">{{ p.t('productos') }}</button>
          <button type="button" [class.activo]="seccion === 'clientes'" (click)="ir('clientes')">{{ p.t('clientes') }}</button>
          <button type="button" [class.activo]="seccion === 'pedidos'" (click)="ir('pedidos')">{{ p.t('pedidosAdmin') }}</button>
        </aside>
        <div>
        <div class="admin-cabecera" id="resumen">
          <h1>{{ p.t('adminTitulo') }}</h1>
          <p>{{ p.t('adminNota') }}</p>
        </div>
        @if (mensaje) { <p class="aviso" [class.ok]="ok" [class.error]="!ok">{{ mensaje }}</p> }
        <div class="kpis">
          <article><span>{{ p.t('productos') }}</span><strong>{{ productos.length }}</strong></article>
          <article><span>{{ p.t('kpiClientes') }}</span><strong>{{ clientes.length }}</strong></article>
          <article><span>{{ p.t('kpiPedidos') }}</span><strong>{{ pedidos.length }}</strong></article>
          <article><span>{{ p.t('kpiAprobar') }}</span><strong>{{ porAprobar() }}</strong></article>
        </div>

        <div class="admin-duo">
          <section class="caja" id="productos">
            <h2>{{ editandoId ? 'Editar producto' : 'Agregar producto' }}</h2>
            <form class="formulario" (ngSubmit)="guardarProducto()">
              <label>Nombre <input name="nombre" [(ngModel)]="formulario.nombre" required minlength="2" /></label>
              <label>Tipo
                <select name="tipo" [(ngModel)]="formulario.tipo" required>
                  <option value="servicio">Servicio técnico</option>
                  <option value="celular">Celular</option>
                  <option value="accesorio">Accesorio</option>
                </select>
              </label>
              <label>Precio <input name="precio" type="number" min="0" step="0.01" [(ngModel)]="formulario.precio" required /></label>
              <label>Imagen <input name="imagen" [(ngModel)]="formulario.imagen" placeholder="img/local.jpg" /></label>
              <label class="ancho">Detalle <input name="detalle" [(ngModel)]="formulario.detalle" required /></label>
              <div class="acciones">
                @if (editandoId) { <button class="boton secundario" type="button" (click)="limpiar()">Cancelar</button> }
                <button class="boton" type="submit">Guardar</button>
              </div>
            </form>
          </section>

          <section class="caja" id="clientes">
            <h2>{{ p.t('clientes') }}</h2>
            <div class="tabla-envoltorio">
              <table>
                <thead><tr><th>Nombre</th><th>Correo</th><th>Estado</th><th></th></tr></thead>
                <tbody>
                  @for (cliente of clientes; track cliente.id) {
                    <tr>
                      <td>{{ cliente.nombre }}</td>
                      <td>{{ cliente.correo }}</td>
                      <td><span class="chip" [class.ok]="cliente.estado === 'APROBADA'" [class.warn]="cliente.estado === 'PENDIENTE'" [class.bad]="cliente.estado === 'RECHAZADA'" [class.mute]="cliente.estado === 'BLOQUEADA'">{{ p.t('est_' + cliente.estado) }}</span></td>
                      <td class="acciones">
                        @if (cliente.verificado && cliente.estado === 'PENDIENTE') {
                          <button type="button" (click)="estadoCliente(cliente, 'APROBADA')">Aprobar</button>
                          <button type="button" (click)="estadoCliente(cliente, 'RECHAZADA')">Rechazar</button>
                        }
                        @if (cliente.estado === 'APROBADA') {
                          <button type="button" (click)="estadoCliente(cliente, 'BLOQUEADA')">Bloquear</button>
                        }
                        @if (cliente.estado === 'BLOQUEADA' || cliente.estado === 'RECHAZADA') {
                          <button type="button" (click)="estadoCliente(cliente, 'APROBADA')">Activar</button>
                        }
                        <button type="button" (click)="borrarCliente(cliente)">Eliminar</button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <section class="caja" id="lista-productos" style="margin-top:16px">
          <h2>{{ p.t('productos') }}</h2>
          <div class="tabla-envoltorio">
            <table>
              <thead><tr><th>Foto</th><th>Tipo</th><th>Nombre</th><th>Detalle</th><th>Precio</th><th></th></tr></thead>
              <tbody>
                @for (producto of productos; track producto.id) {
                  <tr>
                    <td><img class="mini" [src]="foto(producto)" [alt]="producto.nombre" /></td>
                    <td>{{ producto.tipo }}</td>
                    <td>{{ producto.nombre }}</td>
                    <td>{{ producto.detalle }}</td>
                    <td>{{ precio(producto.precio) }}</td>
                    <td class="acciones">
                      <button type="button" (click)="editar(producto)">Editar</button>
                      <button type="button" (click)="borrarProducto(producto)">Eliminar</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>

        <section class="caja" id="pedidos" style="margin-top:16px">
          <h2>{{ p.t('pedidosAdmin') }}</h2>
          <div class="tabla-envoltorio">
            <table>
              <thead><tr><th>#</th><th>Cliente</th><th>Producto</th><th>Total</th><th>Fecha</th><th>Estado</th></tr></thead>
              <tbody>
                @for (pedido of pedidos; track pedido.id) {
                  <tr>
                    <td>{{ pedido.id }}</td>
                    <td>{{ pedido.clienteNombre }}</td>
                    <td>{{ pedido.producto }} × {{ pedido.cantidad }}</td>
                    <td>{{ suma(pedido) }}</td>
                    <td>{{ cuando(pedido.creadoEn) }}</td>
                    <td>
                      <select [value]="pedido.estado" (change)="estadoPedido(pedido, $event)">
                        <option value="EN_PREPARACION">En preparación</option>
                        <option value="LISTO_ENTREGA">Listo para entrega</option>
                      </select>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
        </div>
      </div>
    </section>
  `,
})
export class AdminComponent implements OnInit {
  p = inject(PreferenciasService);
  private admin = inject(AdminService);
  private catalogo = inject(CatalogoService);
  clientes: Usuario[] = [];
  productos: Producto[] = [];
  pedidos: Pedido[] = [];
  formulario: ProductoFormulario = this.vacio();
  editandoId: number | null = null;
  seccion: 'resumen' | 'productos' | 'clientes' | 'pedidos' = 'resumen';
  mensaje = '';
  ok = true;

  ngOnInit(): void { this.cargar(); }

  guardarProducto(): void {
    const datos = { ...this.formulario, precio: Number(this.formulario.precio) };
    const pedido = this.editandoId
      ? this.admin.actualizarProducto(this.editandoId, datos)
      : this.admin.crearProducto(datos);
    pedido.subscribe({
      next: (cuerpo) => {
        this.aviso(cuerpo.mensaje, true);
        this.limpiar();
        this.cargar();
      },
      error: (error) => this.aviso(textoError(error), false),
    });
  }

  editar(producto: Producto): void {
    this.editandoId = producto.id;
    this.formulario = {
      tipo: producto.tipo,
      nombre: producto.nombre,
      detalle: producto.detalle,
      precio: producto.precio,
      imagen: producto.imagen,
    };
    this.ir('productos');
  }

  limpiar(): void {
    this.editandoId = null;
    this.formulario = this.vacio();
  }

  borrarProducto(producto: Producto): void {
    if (!confirm('¿Eliminar ' + producto.nombre + '?')) return;
    this.admin.eliminarProducto(producto.id).subscribe({
      next: (cuerpo) => { this.aviso(cuerpo.mensaje, true); this.cargar(); },
      error: (error) => this.aviso(textoError(error), false),
    });
  }

  estadoCliente(cliente: Usuario, estado: string): void {
    this.admin.cambiarEstadoUsuario(cliente.id, estado).subscribe({
      next: (cuerpo) => { this.aviso(cuerpo.mensaje, true); this.cargar(); },
      error: (error) => this.aviso(textoError(error), false),
    });
  }

  borrarCliente(cliente: Usuario): void {
    if (!confirm('¿Eliminar a ' + cliente.nombre + '? También se borran sus pedidos.')) return;
    this.admin.eliminarUsuario(cliente.id).subscribe({
      next: (cuerpo) => { this.aviso(cuerpo.mensaje, true); this.cargar(); },
      error: (error) => this.aviso(textoError(error), false),
    });
  }

  estadoPedido(pedido: Pedido, evento: Event): void {
    const estado = (evento.target as HTMLSelectElement).value;
    this.admin.cambiarEstadoPedido(pedido.id, estado).subscribe({
      next: (cuerpo) => { this.aviso(cuerpo.mensaje, true); this.cargar(); },
      error: (error) => this.aviso(textoError(error), false),
    });
  }

  ir(id: 'resumen' | 'productos' | 'clientes' | 'pedidos'): void {
    this.seccion = id;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  porAprobar(): number { return this.clientes.filter((cliente) => cliente.estado === 'PENDIENTE').length; }
  enPreparacion(): number { return this.pedidos.filter((pedido) => pedido.estado !== 'LISTO_ENTREGA').length; }
  listos(): number { return this.pedidos.filter((pedido) => pedido.estado === 'LISTO_ENTREGA').length; }
  foto(producto: Producto): string { return rutaImagen(producto.imagen); }
  precio(valor: number): string { return dinero(valor); }
  suma(pedido: Pedido): string { return total(pedido.precio, pedido.cantidad); }
  cuando(iso: string | undefined): string { return fecha(iso); }

  private cargar(): void {
    this.admin.usuarios().subscribe({
      next: (cuerpo) => (this.clientes = cuerpo.usuarios.filter((usuario) => usuario.rol === 'USER')),
      error: (error) => this.aviso(textoError(error), false),
    });
    this.admin.productos().subscribe({ next: (cuerpo) => (this.productos = cuerpo.productos) });
    this.catalogo.pedidos().subscribe({ next: (cuerpo) => (this.pedidos = cuerpo.pedidos) });
  }

  private vacio(): ProductoFormulario {
    return { tipo: 'celular', nombre: '', detalle: '', precio: 0, imagen: 'img/local.jpg' };
  }

  private aviso(texto: string, ok: boolean): void {
    this.mensaje = texto;
    this.ok = ok;
  }
}
