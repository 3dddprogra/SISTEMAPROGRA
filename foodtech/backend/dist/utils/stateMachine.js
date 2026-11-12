"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateMachineError = void 0;
exports.canTransitionOrder = canTransitionOrder;
exports.validateOrderTransition = validateOrderTransition;
exports.getNextPossibleStates = getNextPossibleStates;
class StateMachineError extends Error {
    statusCode;
    from;
    to;
    constructor(from, to, message) {
        super(message || `Transición de estado inválida: '${from}' -> '${to}'. Conflicto de negocio.`);
        this.name = 'StateMachineError';
        this.statusCode = 409; // HTTP 409 Conflict
        this.from = from;
        this.to = to;
    }
}
exports.StateMachineError = StateMachineError;
// Mapa de transiciones estrictas permitidas
const ALLOWED_TRANSITIONS = {
    pendiente: ['en_proceso', 'cancelado'],
    en_proceso: ['terminado', 'cancelado'],
    terminado: ['entregado', 'cancelado'],
    entregado: ['pagado'],
    pagado: [], // Estado terminal
    cancelado: [], // Estado terminal
};
function canTransitionOrder(from, to) {
    if (from === to)
        return true; // idempotente
    const allowed = ALLOWED_TRANSITIONS[from];
    return !!allowed && allowed.includes(to);
}
function validateOrderTransition(from, to) {
    if (!canTransitionOrder(from, to)) {
        throw new StateMachineError(from, to, `No se puede cambiar el pedido de '${from}' a '${to}'. Las transiciones válidas desde '${from}' son: [${(ALLOWED_TRANSITIONS[from] || []).join(', ')}]`);
    }
}
function getNextPossibleStates(current) {
    return ALLOWED_TRANSITIONS[current] || [];
}
