import { describe, it, expect } from 'vitest';
import {
  canTransitionOrder,
  validateOrderTransition,
  StateMachineError,
  getNextPossibleStates,
} from '../src/utils/stateMachine';

describe('Máquina de Estados de Pedidos (FoodTech)', () => {
  it('debe permitir el flujo secuencial válido completo: pendiente -> en_proceso -> terminado -> entregado -> pagado', () => {
    expect(canTransitionOrder('pendiente', 'en_proceso')).toBe(true);
    expect(canTransitionOrder('en_proceso', 'terminado')).toBe(true);
    expect(canTransitionOrder('terminado', 'entregado')).toBe(true);
    expect(canTransitionOrder('entregado', 'pagado')).toBe(true);

    // No debe lanzar excepción
    expect(() => validateOrderTransition('pendiente', 'en_proceso')).not.toThrow();
    expect(() => validateOrderTransition('en_proceso', 'terminado')).not.toThrow();
    expect(() => validateOrderTransition('terminado', 'entregado')).not.toThrow();
    expect(() => validateOrderTransition('entregado', 'pagado')).not.toThrow();
  });

  it('debe permitir cancelaciones válidas desde pendiente y en_proceso', () => {
    expect(canTransitionOrder('pendiente', 'cancelado')).toBe(true);
    expect(canTransitionOrder('en_proceso', 'cancelado')).toBe(true);
    expect(canTransitionOrder('terminado', 'cancelado')).toBe(true);
  });

  it('debe rechazar saltos de estado ilegales lanzando StateMachineError con código 409', () => {
    // Intentar pagar directamente sin cocinar ni entregar
    expect(() => validateOrderTransition('pendiente', 'pagado')).toThrow(StateMachineError);
    try {
      validateOrderTransition('pendiente', 'pagado');
    } catch (e: unknown) {
      const err = e as StateMachineError;
      expect(err.statusCode).toBe(409);
      expect(err.from).toBe('pendiente');
      expect(err.to).toBe('pagado');
    }

    // Intentar marcar terminado antes de estar en proceso
    expect(() => validateOrderTransition('pendiente', 'terminado')).toThrow(StateMachineError);

    // Intentar retroceder en el tiempo
    expect(() => validateOrderTransition('terminado', 'pendiente')).toThrow(StateMachineError);
    expect(() => validateOrderTransition('entregado', 'en_proceso')).toThrow(StateMachineError);
  });

  it('debe considerar los estados terminales "pagado" y "cancelado" inmutables', () => {
    expect(canTransitionOrder('pagado', 'en_proceso')).toBe(false);
    expect(canTransitionOrder('pagado', 'pendiente')).toBe(false);
    expect(canTransitionOrder('cancelado', 'pendiente')).toBe(false);

    expect(() => validateOrderTransition('pagado', 'pendiente')).toThrow(StateMachineError);
    expect(() => validateOrderTransition('cancelado', 'en_proceso')).toThrow(StateMachineError);
  });

  it('getNextPossibleStates debe listar correctamente los siguientes pasos', () => {
    expect(getNextPossibleStates('pendiente')).toEqual(['en_proceso', 'cancelado']);
    expect(getNextPossibleStates('en_proceso')).toEqual(['terminado', 'cancelado']);
    expect(getNextPossibleStates('terminado')).toEqual(['entregado', 'cancelado']);
    expect(getNextPossibleStates('entregado')).toEqual(['pagado']);
    expect(getNextPossibleStates('pagado')).toEqual([]);
    expect(getNextPossibleStates('cancelado')).toEqual([]);
  });
});
