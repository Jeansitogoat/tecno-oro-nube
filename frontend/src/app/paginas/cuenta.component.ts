import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService, textoError } from '../servicios/auth.service';
import { CatalogoService } from '../servicios/catalogo.service';

@Component({
  selector: 'app-cuenta',
  imports: [FormsModule],
  template: `
    <section class="bloque">
      <div class="contenedor angosto">
        <h1>Tu cuenta</h1>
        <p>Puedes cambiar el nombre. La contraseña nueva es opcional y pide la actual.</p>
        @if (mensaje) { <p class="aviso" [class.ok]="ok" [class.error]="!ok">{{ mensaje }}</p> }
        <form (ngSubmit)="guardar()">
          <label>Nombre <input name="nombre" [(ngModel)]="nombre" required minlength="2" /></label>
          <label>Contraseña actual <input name="actual" type="password" [(ngModel)]="passwordActual" /></label>
          <label>Contraseña nueva <input name="nueva" type="password" [(ngModel)]="passwordNueva" minlength="6" /></label>
          <button class="boton" type="submit">Guardar</button>
        </form>
      </div>
    </section>
  `,
})
export class CuentaComponent implements OnInit {
  private catalogo = inject(CatalogoService);
  private auth = inject(AuthService);
  nombre = '';
  passwordActual = '';
  passwordNueva = '';
  mensaje = '';
  ok = true;

  ngOnInit(): void {
    this.nombre = this.auth.usuario()?.nombre || '';
  }

  guardar(): void {
    this.catalogo.perfil({
      nombre: this.nombre,
      passwordActual: this.passwordActual || undefined,
      passwordNueva: this.passwordNueva || undefined,
    }).subscribe({
      next: (cuerpo) => {
        this.auth.usuario.set(cuerpo.usuario);
        this.passwordActual = '';
        this.passwordNueva = '';
        this.mensaje = cuerpo.mensaje;
        this.ok = true;
      },
      error: (error) => {
        this.mensaje = textoError(error);
        this.ok = false;
      },
    });
  }
}
