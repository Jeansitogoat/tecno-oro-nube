import { environment } from '../../environments/environment';

export function dinero(valor: number): string {
  const numero = Number(valor) || 0;
  return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(numero);
}

export function fecha(iso: string | undefined): string {
  if (!iso) {
    return '—';
  }
  const valor = new Date(iso);
  if (Number.isNaN(valor.getTime())) {
    return iso;
  }
  return valor.toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' });
}

export function rutaImagen(imagen: string | undefined): string {
  const base = environment.apiUrl.replace(/\/api\/?$/, '');
  const limpia = String(imagen || 'img/local.jpg').replace(/^\//, '');
  return base + '/' + limpia;
}

export function total(precio: number, cantidad: number): string {
  return dinero(Number(precio) * Number(cantidad));
}
