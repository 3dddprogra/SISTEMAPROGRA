"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mesaService = void 0;
const mesaRepository_1 = require("../repositories/mesaRepository");
const socketManager_1 = require("../sockets/socketManager");
exports.mesaService = {
    async getMesas() {
        return mesaRepository_1.mesaRepository.findAll();
    },
    async getMesaById(id) {
        const mesa = await mesaRepository_1.mesaRepository.findById(id);
        if (!mesa) {
            throw { statusCode: 404, code: 'NOT_FOUND', message: `Mesa con ID ${id} no encontrada.` };
        }
        return mesa;
    },
    async updateEstado(id, estado) {
        const mesa = await mesaRepository_1.mesaRepository.findById(id);
        if (!mesa) {
            throw { statusCode: 404, code: 'NOT_FOUND', message: `Mesa con ID ${id} no encontrada.` };
        }
        await mesaRepository_1.mesaRepository.updateEstado(id, estado);
        socketManager_1.socketEmitter.emitEstadoMesa(id, estado);
        return { ...mesa, estado };
    },
};
