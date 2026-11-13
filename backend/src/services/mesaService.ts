import { mesaRepository } from '../repositories/mesaRepository';
import { EstadoMesa } from '../types';
import { socketEmitter } from '../sockets/socketManager';

export const mesaService = {
  async getMesas() {
    return mesaRepository.findAll();
  },

  async getMesaById(id: number) {
    const mesa = await mesaRepository.findById(id);
    if (!mesa) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: `Mesa con ID ${id} no encontrada.` };
    }
    return mesa;
  },

  async updateEstado(id: number, estado: EstadoMesa) {
    const mesa = await mesaRepository.findById(id);
    if (!mesa) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: `Mesa con ID ${id} no encontrada.` };
    }

    await mesaRepository.updateEstado(id, estado);
    socketEmitter.emitEstadoMesa(id, estado);
    return { ...mesa, estado };
  },
};
