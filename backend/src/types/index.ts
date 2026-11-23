export type RolUsuario = 'admin' | 'cajero' | 'cocina';

export type EstadoMesa = 'disponible' | 'ocupada' | 'reservada' | 'inactiva';

// Modelo de PRE-PAGO (Nori Pollo): por_cobrar -> pagado -> en_proceso -> terminado -> entregado
export type EstadoPedido =
  | 'por_cobrar'
  | 'pagado'
  | 'en_proceso'
  | 'terminado'
  | 'entregado'
  | 'cancelado';

// RN09: solo se acepta efectivo o QR (no tarjeta, no factura)
export type MetodoPago = 'efectivo' | 'qr';

// RN01: la mesa virtual número 8 es el «Mostrador – Para llevar»
export const MESA_PARA_LLEVAR = 8;

export type EstadoReserva = 'pendiente' | 'confirmada' | 'cancelada' | 'completada';

export type EstadoListaEspera = 'esperando' | 'notificado' | 'sentado' | 'cancelado';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  password_hash: string;
  rol: RolUsuario;
  activo: boolean;
  creado_en?: string;
  actualizado_en?: string;
}

export interface Mesa {
  id: number;
  numero: number;
  capacidad: number;
  estado: EstadoMesa;
  ubicacion: string;
  qr_token?: string | null;
  creado_en?: string;
  actualizado_en?: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string | null;
  icono?: string | null;
  orden: number;
  activo: boolean;
  creado_en?: string;
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
  creado_en?: string;
  actualizado_en?: string;
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
  actualizado_en?: string;
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
  actualizado_en?: string;
}

export interface JwtPayload {
  id: number;
  email: string;
  nombre: string;
  rol: RolUsuario;
}

export interface MesaTokenPayload {
  mesaId: number;
  numero: number;
  iat?: number;
  exp?: number;
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
