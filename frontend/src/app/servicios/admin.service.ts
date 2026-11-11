import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Pedido, Producto, Usuario } from '../modelos';

export interface ProductoFormulario {
  tipo: string;
  nombre: string;
  detalle: string;
  precio: number;
  imagen: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private http: HttpClient) {}

  usuarios(): Observable<{ usuarios: Usuario[] }> {
    return this.http.get<{ usuarios: Usuario[] }>(environment.apiUrl + '/admin/usuarios');
  }

  cambiarEstadoUsuario(id: number, estado: string): Observable<{ mensaje: string }> {
    return this.http.patch<{ mensaje: string }>(environment.apiUrl + '/admin/usuarios/' + id + '/estado', { estado });
  }

  eliminarUsuario(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(environment.apiUrl + '/admin/usuarios/' + id);
  }

  productos(): Observable<{ productos: Producto[] }> {
    return this.http.get<{ productos: Producto[] }>(environment.apiUrl + '/admin/productos');
  }

  crearProducto(datos: ProductoFormulario): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(environment.apiUrl + '/admin/productos', datos);
  }

  actualizarProducto(id: number, datos: ProductoFormulario): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(environment.apiUrl + '/admin/productos/' + id, datos);
  }

  eliminarProducto(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(environment.apiUrl + '/admin/productos/' + id);
  }

  cambiarEstadoPedido(id: number, estado: string): Observable<{ mensaje: string }> {
    return this.http.patch<{ mensaje: string }>(environment.apiUrl + '/admin/pedidos/' + id + '/estado', { estado });
  }
}
