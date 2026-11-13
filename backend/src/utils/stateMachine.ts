import { EstadoPedido } from '../types';

export class StateMachineError extends Error {
  public statusCode: number;
  public from: EstadoPedido;
  public to: EstadoPedido;

  constructor(from: EstadoPedido, to: EstadoPedido, message?: string) {
    super(message || `Transición de estado inválida: '${from}' -> '${to}'. Conflicto de negocio.`);
    this.name = 'StateMachineError';
    this.statusCode = 409; // HTTP 409 Conflict
    this.from = from;
    this.to = to;
  }
}

// Mapa de transiciones estrictas permitidas
const ALLOWED_TRANSITIONS: Record<EstadoPedido, EstadoPedido[]> = {
  pendiente: ['en_proceso', 'cancelado'],
  en_proceso: ['terminado', 'cancelado'],
  terminado: ['entregado', 'cancelado'],
  entregado: ['pagado'],
  pagado: [], // Estado terminal
  cancelado: [], // Estado terminal
};

export function canTransitionOrder(from: EstadoPedido, to: EstadoPedido): boolean {
  if (from === to) return true; // idempotente
  const allowed = ALLOWED_TRANSITIONS[from];
  return !!allowed && allowed.includes(to);
}

export function validateOrderTransition(from: EstadoPedido, to: EstadoPedido): void {
  if (!canTransitionOrder(from, to)) {
    throw new StateMachineError(
      from,
      to,
      `No se puede cambiar el pedido de '${from}' a '${to}'. Las transiciones válidas desde '${from}' son: [${(
        ALLOWED_TRANSITIONS[from] || []
      ).join(', ')}]`
    );
  }
}

export function getNextPossibleStates(current: EstadoPedido): EstadoPedido[] {
  return ALLOWED_TRANSITIONS[current] || [];
}
