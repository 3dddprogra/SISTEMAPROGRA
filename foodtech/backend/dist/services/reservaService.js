"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reservaService = void 0;
const reservaRepository_1 = require("../repositories/reservaRepository");
const mesaRepository_1 = require("../repositories/mesaRepository");
const socketManager_1 = require("../sockets/socketManager");
exports.reservaService = {
    async getReservas() {
        return reservaRepository_1.reservaRepository.findAll();
    },
    async crearReserva(data) {
        const mesa = await mesaRepository_1.mesaRepository.findById(data.mesa_id);
        if (!mesa) {
            throw { statusCode: 404, code: 'MESA_NOT_FOUND', message: `La mesa #${data.mesa_id} no existe.` };
        }
        const id = await reservaRepository_1.reservaRepository.create(data);
        const reservaCreada = await reservaRepository_1.reservaRepository.findById(id);
        if (reservaCreada) {
            socketManager_1.socketEmitter.emitReservaActualizada(reservaCreada);
        }
        return reservaCreada;
    },
    async actualizarEstado(id, estado) {
        const reserva = await reservaRepository_1.reservaRepository.findById(id);
        if (!reserva) {
            throw { statusCode: 404, code: 'NOT_FOUND', message: `Reserva con ID ${id} no encontrada.` };
        }
        await reservaRepository_1.reservaRepository.updateEstado(id, estado);
        const updated = { ...reserva, estado };
        socketManager_1.socketEmitter.emitReservaActualizada(updated);
        return updated;
    },
};
