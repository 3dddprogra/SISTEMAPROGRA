"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listaEsperaService = void 0;
const listaEsperaRepository_1 = require("../repositories/listaEsperaRepository");
const mesaRepository_1 = require("../repositories/mesaRepository");
const socketManager_1 = require("../sockets/socketManager");
exports.listaEsperaService = {
    async getLista() {
        return listaEsperaRepository_1.listaEsperaRepository.findAll();
    },
    async agregarCliente(data) {
        const id = await listaEsperaRepository_1.listaEsperaRepository.create(data);
        const lista = await listaEsperaRepository_1.listaEsperaRepository.findAll();
        const item = lista.find(l => l.id === id);
        if (item) {
            socketManager_1.socketEmitter.emitEsperaActualizada(item);
        }
        return item;
    },
    async actualizarEstado(id, estado, mesaId) {
        if (mesaId) {
            const mesa = await mesaRepository_1.mesaRepository.findById(mesaId);
            if (!mesa) {
                throw { statusCode: 404, code: 'MESA_NOT_FOUND', message: `Mesa con ID ${mesaId} no encontrada.` };
            }
        }
        await listaEsperaRepository_1.listaEsperaRepository.updateEstado(id, estado, mesaId);
        const lista = await listaEsperaRepository_1.listaEsperaRepository.findAll();
        const item = lista.find(l => l.id === id);
        if (item) {
            socketManager_1.socketEmitter.emitEsperaActualizada(item);
        }
        return item;
    },
    async sentarCliente(id, mesaId) {
        await mesaRepository_1.mesaRepository.updateEstado(mesaId, 'ocupada');
        socketManager_1.socketEmitter.emitEstadoMesa(mesaId, 'ocupada');
        return this.actualizarEstado(id, 'sentado', mesaId);
    },
};
