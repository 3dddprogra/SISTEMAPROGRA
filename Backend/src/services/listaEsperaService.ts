import { listaEsperaRepository } from '../repositories/listaEsperaRepository';
import { mesaRepository } from '../repositories/mesaRepository';
import { EstadoListaEspera } from '../types';
import { socketEmitter } from '../sockets/socketManager';

export const listaEsperaService = {
  async getLista() {
    return listaEsperaRepository.findAll();
  },

  async agregarCliente(data: {
    cliente_nombre: string;
    telefono: string;
    num_personas: number;
    tiempo_estimado_espera?: number;
    notas?: string | null;
  }) {
    const id = await listaEsperaRepository.create(data);
    const lista = await listaEsperaRepository.findAll();
    const item = lista.find(l => l.id === id);
    if (item) {
      socketEmitter.emitEsperaActualizada(item);
    }
    return item;
  },

  async actualizarEstado(id: number, estado: EstadoListaEspera, mesaId?: number | null) {
    if (mesaId) {
      const mesa = await mesaRepository.findById(mesaId);
      if (!mesa) {
        throw { statusCode: 404, code: 'MESA_NOT_FOUND', message: `Mesa con ID ${mesaId} no encontrada.` };
      }
    }

    await listaEsperaRepository.updateEstado(id, estado, mesaId);
    const lista = await listaEsperaRepository.findAll();
    const item = lista.find(l => l.id === id);
    if (item) {
      socketEmitter.emitEsperaActualizada(item);
    }
    return item;
  },

  async sentarCliente(id: number, mesaId: number) {
    await mesaRepository.updateEstado(mesaId, 'ocupada');
    socketEmitter.emitEstadoMesa(mesaId, 'ocupada');
    return this.actualizarEstado(id, 'sentado', mesaId);
  },
};
