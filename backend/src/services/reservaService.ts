import { reservaRepository } from '../repositories/reservaRepository';
import { mesaRepository } from '../repositories/mesaRepository';
import { EstadoReserva } from '../types';
import { socketEmitter } from '../sockets/socketManager';

export const reservaService = {
  async getReservas() {
    return reservaRepository.findAll();
  },

  async crearReserva(data: {
    mesa_id: number;
    cliente_nombre: string;
    cliente_telefono: string;
    cliente_email?: string | null;
    num_personas: number;
    fecha_hora: string;
    notas?: string | null;
  }) {
    const mesa = await mesaRepository.findById(data.mesa_id);
    if (!mesa) {
      throw { statusCode: 404, code: 'MESA_NOT_FOUND', message: `La mesa #${data.mesa_id} no existe.` };
    }

    const id = await reservaRepository.create(data);
    const reservaCreada = await reservaRepository.findById(id);
    if (reservaCreada) {
      socketEmitter.emitReservaActualizada(reservaCreada);
    }
    return reservaCreada;
  },

  async actualizarEstado(id: number, estado: EstadoReserva) {
    const reserva = await reservaRepository.findById(id);
    if (!reserva) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: `Reserva con ID ${id} no encontrada.` };
    }

    await reservaRepository.updateEstado(id, estado);
    const updated = { ...reserva, estado };
    socketEmitter.emitReservaActualizada(updated);
    return updated;
  },
};
