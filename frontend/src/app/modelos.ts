export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: 'USER' | 'ADMIN';
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'BLOQUEADA';
  verificado: boolean;
  creadoEn?: string;
}

export interface Producto {
  id: number;
  tipo: 'servicio' | 'celular' | 'accesorio';
  nombre: string;
  detalle: string;
  precio: number;
  imagen: string;
}

export interface Pedido {
  id: number;
  cantidad: number;
  estado: 'EN_PREPARACION' | 'LISTO_ENTREGA';
  creadoEn: string;
  usuarioId: number;
  productoId: number;
  clienteNombre: string;
  correo: string;
  productoTipo: string;
  producto: string;
  productoDetalle: string;
  precio: number;
}

export interface LineaCarrito {
  productoId: number;
  nombre: string;
  precio: number;
  cantidad: number;
}
