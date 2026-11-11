import { Injectable, signal } from '@angular/core';
import { completar, Idioma, TEXTOS } from '../textos';

const IDIOMAS: Idioma[] = ['es', 'en', 'qu'];
const TEMAS = ['claro', 'oscuro', 'contraste', 'mono'] as const;
export type Tema = (typeof TEMAS)[number];

@Injectable({ providedIn: 'root' })
export class PreferenciasService {
  readonly idioma = signal<Idioma>(this.leerIdioma());
  readonly tema = signal<Tema>(this.leerTema());
  readonly escala = signal(this.leerEscala());

  constructor() {
    this.aplicar();
  }

  t(clave: string, datos?: Record<string, string | number>): string {
    const tabla = TEXTOS[this.idioma()] || TEXTOS.es;
    return completar(tabla[clave] || TEXTOS.es[clave] || clave, datos);
  }

  setIdioma(siguiente: string): void {
    if (siguiente === 'es' || siguiente === 'en' || siguiente === 'qu') {
      this.idioma.set(siguiente);
      this.aplicar();
    }
  }

  setTema(siguiente: string): void {
    if (siguiente === 'claro' || siguiente === 'oscuro' || siguiente === 'contraste' || siguiente === 'mono') {
      this.tema.set(siguiente);
      this.aplicar();
    }
  }

  setEscala(siguiente: number): void {
    if (siguiente < 0 || siguiente > 3) return;
    this.escala.set(siguiente);
    this.aplicar();
  }

  restablecer(): void {
    this.tema.set('claro');
    this.escala.set(0);
    this.aplicar();
  }

  private aplicar(): void {
    const raiz = document.documentElement;
    raiz.lang = this.idioma();
    raiz.dataset['tema'] = this.tema();
    raiz.dataset['escala'] = String(this.escala());
    localStorage.setItem('tecno-oro-idioma', this.idioma());
    localStorage.setItem('tecno-oro-tema', this.tema());
    localStorage.setItem('tecno-oro-escala', String(this.escala()));
  }

  private leerIdioma(): Idioma {
    const valor = localStorage.getItem('tecno-oro-idioma');
    return valor === 'en' || valor === 'qu' ? valor : 'es';
  }

  private leerTema(): Tema {
    const valor = localStorage.getItem('tecno-oro-tema');
    return valor === 'oscuro' || valor === 'contraste' || valor === 'mono' ? valor : 'claro';
  }

  private leerEscala(): number {
    const valor = Number(localStorage.getItem('tecno-oro-escala'));
    return valor >= 0 && valor <= 3 ? valor : 0;
  }
}
