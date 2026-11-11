import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { PreferenciasService } from '../servicios/preferencias.service';

@Component({
  selector: 'app-accesibilidad',
  template: `
    <div class="a11y">
      <button type="button" class="a11y-boton" [attr.aria-expanded]="abierto()" aria-controls="panel-accesibilidad" (click)="alternar()">
        <svg viewBox="0 0 24 24" aria-hidden="true" class="a11y-icono">
          <circle cx="12" cy="5" r="2.2" fill="currentColor" />
          <path fill="currentColor" d="M8.2 9.2h7.6c.7 0 1.2.6 1.1 1.3l-.8 6.2h-1.7l.5-3.4-1.2 6.5h-1.6l.4-6.5-.4 6.5H9.9l-1.2-6.5.5 3.4H7.5l-.8-6.2c-.1-.7.4-1.3 1.1-1.3z" />
        </svg>
        <span class="a11y-boton-texto">{{ p.t('a11yAbrir') }}</span>
      </button>
      @if (abierto()) {
        <section class="a11y-panel" id="panel-accesibilidad" role="dialog" aria-modal="false" #panel>
          <header class="a11y-cabecera">
            <h2>{{ p.t('a11yTitulo') }}</h2>
            <button type="button" class="a11y-cerrar" (click)="abierto.set(false)">{{ p.t('cerrar') }}</button>
          </header>
          <p class="a11y-etiqueta">{{ p.t('a11yTexto') }}</p>
          <div class="a11y-fila">
            <button type="button" class="a11y-opcion" (click)="p.setEscala(p.escala() - 1)" [disabled]="p.escala() <= 0">A−<span>{{ p.t('a11yMenos') }}</span></button>
            <button type="button" class="a11y-opcion" (click)="p.setEscala(p.escala() + 1)" [disabled]="p.escala() >= 3">A+<span>{{ p.t('a11yMas') }}</span></button>
          </div>
          <p class="a11y-etiqueta">{{ p.t('a11yApariencia') }}</p>
          <div class="a11y-fila">
            @for (tema of temas; track tema) {
              <button type="button" class="a11y-opcion" [class.a11y-opcion-activa]="p.tema() === tema" (click)="p.setTema(tema)">{{ p.t(tema) }}</button>
            }
          </div>
          <p class="a11y-etiqueta">{{ p.t('idioma') }}</p>
          <div class="a11y-fila">
            @for (item of idiomas; track item.id) {
              <button type="button" class="a11y-opcion" [class.a11y-opcion-activa]="p.idioma() === item.id" [attr.lang]="item.id" (click)="p.setIdioma(item.id)">{{ item.texto }}</button>
            }
          </div>
          <button type="button" class="a11y-reset" (click)="p.restablecer()">{{ p.t('restablecer') }}</button>
        </section>
      }
    </div>
  `,
})
export class AccesibilidadComponent {
  p = inject(PreferenciasService);
  abierto = signal(false);
  panel = viewChild<ElementRef<HTMLElement>>('panel');
  temas = ['claro', 'oscuro', 'contraste', 'mono'];
  idiomas = [
    { id: 'es', texto: 'Español' },
    { id: 'en', texto: 'English' },
    { id: 'qu', texto: 'Kichwa' },
  ];

  alternar(): void {
    this.abierto.update((valor) => !valor);
    if (!this.abierto()) return;
    setTimeout(() => this.panel()?.nativeElement.querySelector('button')?.focus(), 0);
    const cerrar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        this.abierto.set(false);
        document.removeEventListener('keydown', cerrar);
      }
    };
    document.addEventListener('keydown', cerrar);
  }
}
