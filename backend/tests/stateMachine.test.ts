import { describe, it, expect } from 'vitest';
import {
  canTransitionOrder,
  validateOrderTransition,
  StateMachineError,
  getNextPossibleStates,
} from '../src/utils/stateMachine';

// RN07 (Nori Pollo, modelo de PRE-PAGO):
// por_cobrar -> pagado -> en_proceso -> terminado -> entregado
describe('Máquina de Estados de Pedidos (pre-pago)', () => {
  it('permite el flujo completo: por_cobrar -> pagado -> en_proceso -> terminado -> entregado', () => {
    expect(canTransitionOrder('por_cobrar', 'pagado')).toBe(true);
    expect(canTransitionOrder('pagado', 'en_proceso')).toBe(true);
    expect(canTransitionOrder('en_proceso', 'terminado')).toBe(true);
    expect(canTransitionOrder('terminado', 'entregado')).toBe(true);

    expect(() => validateOrderTransition('por_cobrar', 'pagado')).not.toThrow();
    expect(() => validateOrderTransition('pagado', 'en_proceso')).not.toThrow();
    expect(() => validateOrderTransition('en_proceso', 'terminado')).not.toThrow();
    expect(() => validateOrderTransition('terminado', 'entregado')).not.toThrow();
  });

  it('solo permite cancelar ANTES de iniciar la preparación (por_cobrar o pagado)', () => {
    expect(canTransitionOrder('por_cobrar', 'cancelado')).toBe(true);
    expect(canTransitionOrder('pagado', 'cancelado')).toBe(true);
    expect(canTransitionOrder('en_proceso', 'cancelado')).toBe(false);
    expect(canTransitionOrder('terminado', 'cancelado')).toBe(false);
  });

  it('la cocina nunca recibe un pedido sin pagar: por_cobrar no puede pasar a en_proceso', () => {
    expect(canTransitionOrder('por_cobrar', 'en_proceso')).toBe(false);
    expect(canTransitionOrder('por_cobrar', 'terminado')).toBe(false);
    expect(canTransitionOrder('por_cobrar', 'entregado')).toBe(false);
  });

  it('rechaza saltos ilegales con StateMachineError y código HTTP 409', () => {
    expect(() => validateOrderTransition('por_cobrar', 'en_proceso')).toThrow(StateMachineError);
    try {
      validateOrderTransition('por_cobrar', 'en_proceso');
    } catch (e: unknown) {
      const err = e as StateMachineError;
      expect(err.statusCode).toBe(409);
      expect(err.from).toBe('por_cobrar');
      expect(err.to).toBe('en_proceso');
    }
    expect(() => validateOrderTransition('pagado', 'terminado')).toThrow(StateMachineError);
    // No se puede retroceder
    expect(() => validateOrderTransition('terminado', 'en_proceso')).toThrow(StateMachineError);
    expect(() => validateOrderTransition('entregado', 'terminado')).toThrow(StateMachineError);
  });

  it('"entregado" y "cancelado" son estados terminales', () => {
    for (const destino of ['por_cobrar', 'pagado', 'en_proceso', 'terminado'] as const) {
      expect(canTransitionOrder('entregado', destino)).toBe(false);
      expect(canTransitionOrder('cancelado', destino)).toBe(false);
    }
  });

  it('es idempotente: repetir el mismo estado no falla', () => {
    expect(canTransitionOrder('pagado', 'pagado')).toBe(true);
  });

  it('getNextPossibleStates lista los siguientes pasos válidos', () => {
    expect(getNextPossibleStates('por_cobrar')).toEqual(['pagado', 'cancelado']);
    expect(getNextPossibleStates('pagado')).toEqual(['en_proceso', 'cancelado']);
    expect(getNextPossibleStates('en_proceso')).toEqual(['terminado']);
    expect(getNextPossibleStates('terminado')).toEqual(['entregado']);
    expect(getNextPossibleStates('entregado')).toEqual([]);
  });
});
