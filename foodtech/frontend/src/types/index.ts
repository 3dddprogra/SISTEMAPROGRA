export type RolUsuario = 'admin' | 'cajero' | 'cocina';

export type EstadoMesa = 'disponible' | 'ocupada' | 'reservada' | 'inactiva';

export type EstadoPedido =
  | 'pendiente'
  | 'en_proceso'
  | 'terminado'
  | 'entregado'
  | 'pagado'
  | 'cancelado';

export type MetodoPago = 'efectivo' | 'tarjeta' | 'qr' | 'transferencia';

export type EstadoReserva = 'pendiente' | 'confirmada' | 'cancelada' | 'completada';

export type EstadoListaEspera = 'esperando' | 'notificado' | 'sentado' | 'cancelado';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: RolUsuario;
}

export interface Mesa {
  id: number;
  numero: number;
  capacidad: number;
  estado: EstadoMesa;
  ubicacion: string;
  qr_token?: string | null;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string | null;
  icono?: string | null;
  orden: number;
  activo: boolean;
}

export interface Producto {
  id: number;
  categoria_id: number;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  imagen_url?: string | null;
  disponible: boolean;
  tiempo_estimado_min: number;
  categoria_nombre?: string;
}

export interface DetallePedido {
  id?: number;
  pedido_id?: number;
  producto_id: number;
  nombre_producto?: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  notas?: string | null;
}

export interface Pedido {
  id: number;
  mesa_id: number;
  numero_mesa?: number;
  usuario_id?: number | null;
  usuario_nombre?: string | null;
  codigo: string;
  estado: EstadoPedido;
  total: number;
  metodo_pago?: MetodoPago | null;
  notas?: string | null;
  creado_en: string;
  actualizado_en: string;
  detalles?: DetallePedido[];
}

export interface Reserva {
  id: number;
  mesa_id: number;
  numero_mesa?: number;
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_email?: string | null;
  num_personas: number;
  fecha_hora: string;
  estado: EstadoReserva;
  notas?: string | null;
  creado_en?: string;
}

export interface ListaEspera {
  id: number;
  cliente_nombre: string;
  telefono: string;
  num_personas: number;
  posicion: number;
  estado: EstadoListaEspera;
  mesa_asignada_id?: number | null;
  numero_mesa?: number | null;
  hora_llegada: string;
  tiempo_estimado_espera: number;
  notas?: string | null;
}

export interface ResumenFacturacion {
  ingresosTotales: number;
  pedidosCompletados: number;
  ticketPromedio: number;
  pedidosHoy: number;
  metodosPago: Array<{ metodo: string; total: number; cantidad: number }>;
  topProductos: Array<{ nombre: string; cantidad: number; total: number }>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface CartItem {
  producto: Producto;
  cantidad: number;
  notas?: string;
}
