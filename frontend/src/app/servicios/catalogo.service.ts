import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Pedido, Producto, Usuario } from '../modelos';

@Injectable({ providedIn: 'root' })
export class CatalogoService {
  constructor(private http: HttpClient) {}

  productos(): Observable<{ productos: Producto[] }> {
    return this.http.get<{ productos: Producto[] }>(environment.apiUrl + '/productos');
  }

  producto(id: number): Observable<{ producto: Producto }> {
    return this.http.get<{ producto: Producto }>(environment.apiUrl + '/productos/' + id);
  }

  pedidos(): Observable<{ pedidos: Pedido[] }> {
    return this.http.get<{ pedidos: Pedido[] }>(environment.apiUrl + '/pedidos');
  }

  crearPedido(productoId: number, cantidad: number): Observable<{ mensaje: string; pedido: Pedido }> {
    return this.http.post<{ mensaje: string; pedido: Pedido }>(environment.apiUrl + '/pedidos', {
      productoId,
      cantidad,
    });
  }

  perfil(datos: { nombre: string; passwordActual?: string; passwordNueva?: string }): Observable<{ mensaje: string; usuario: Usuario }> {
    return this.http.patch<{ mensaje: string; usuario: Usuario }>(environment.apiUrl + '/auth/perfil', datos);
  }
}
