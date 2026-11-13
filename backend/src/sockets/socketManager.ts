import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { Pedido, EstadoMesa, Reserva, ListaEspera } from '../types';
import { logger } from '../utils/logger';

let ioInstance: SocketIOServer | null = null;

export function initSocketIO(server: HttpServer): SocketIOServer {
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`Cliente conectado vía WebSocket: ${socket.id}`);

    // Unirse a sala de mesa específica (para clientes QR)
    socket.on('unirse:mesa', (mesaId: number | string) => {
      const room = `mesa:${mesaId}`;
      socket.join(room);
      logger.info(`Socket ${socket.id} se unió a sala ${room}`);
      socket.emit('conectado:mesa', { room, mesaId });
    });

    // Unirse a sala de cocina (KDS)
    socket.on('unirse:cocina', () => {
      socket.join('cocina');
      logger.info(`Socket ${socket.id} se unió a sala 'cocina'`);
      socket.emit('conectado:cocina', { ok: true });
    });

    // Unirse a sala de caja / administración
    socket.on('unirse:caja', () => {
      socket.join('caja');
      logger.info(`Socket ${socket.id} se unió a sala 'caja'`);
      socket.emit('conectado:caja', { ok: true });
    });

    socket.on('disconnect', (reason) => {
      logger.debug(`Socket desconectado: ${socket.id} (${reason})`);
    });
  });

  ioInstance = io;
  return io;
}

export function getIO(): SocketIOServer | null {
  return ioInstance;
}

export const socketEmitter = {
  emitNuevoPedido(pedido: Pedido): void {
    if (!ioInstance) return;
    logger.info(`Emitiendo 'pedido:nuevo' para pedido #${pedido.codigo} a 'cocina' y 'caja'`);
    ioInstance.to('cocina').to('caja').emit('pedido:nuevo', pedido);
    ioInstance.to(`mesa:${pedido.mesa_id}`).emit('pedido:estado', pedido);
  },

  emitEstadoPedido(pedido: Pedido): void {
    if (!ioInstance) return;
    logger.info(`Emitiendo 'pedido:estado' [${pedido.estado}] para pedido #${pedido.codigo}`);
    ioInstance.to(`mesa:${pedido.mesa_id}`).emit('pedido:estado', pedido);
    ioInstance.to('cocina').to('caja').emit('pedido:estado', pedido);
  },

  emitEstadoMesa(mesaId: number, estado: EstadoMesa): void {
    if (!ioInstance) return;
    logger.info(`Emitiendo 'mesa:estado' [${estado}] para mesa #${mesaId}`);
    ioInstance.to('caja').emit('mesa:estado', { mesaId, estado });
  },

  emitReservaActualizada(reserva: Reserva): void {
    if (!ioInstance) return;
    logger.info(`Emitiendo 'reserva:actualizada' para reserva #${reserva.id}`);
    ioInstance.to('caja').emit('reserva:actualizada', reserva);
  },

  emitEsperaActualizada(item: ListaEspera): void {
    if (!ioInstance) return;
    logger.info(`Emitiendo 'espera:actualizada' para lista de espera #${item.id}`);
    ioInstance.to('caja').emit('espera:actualizada', item);
  },
};
