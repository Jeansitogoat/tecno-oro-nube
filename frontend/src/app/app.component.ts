import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AccesibilidadComponent } from './componentes/accesibilidad.component';
import { CabeceraComponent } from './componentes/cabecera.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CabeceraComponent, AccesibilidadComponent],
  template: `
    <div class="lienzo" [class.lienzo-acceso]="acceso()">
      <app-cabecera></app-cabecera>
      <main id="contenido">
        <router-outlet></router-outlet>
      </main>
    </div>
    <app-accesibilidad></app-accesibilidad>
  `,
})
export class AppComponent {
  private router = inject(Router);

  acceso(): boolean {
    return this.router.url.startsWith('/entrar');
  }
}
