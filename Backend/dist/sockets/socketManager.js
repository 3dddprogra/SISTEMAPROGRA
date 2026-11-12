"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketEmitter = void 0;
exports.initSocketIO = initSocketIO;
exports.getIO = getIO;
const socket_io_1 = require("socket.io");
const logger_1 = require("../utils/logger");
let ioInstance = null;
function initSocketIO(server) {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
            credentials: true,
        },
        pingInterval: 10000,
        pingTimeout: 5000,
    });
    io.on('connection', (socket) => {
        logger_1.logger.info(`Cliente conectado vía WebSocket: ${socket.id}`);
        // Unirse a sala de mesa específica (para clientes QR)
        socket.on('unirse:mesa', (mesaId) => {
            const room = `mesa:${mesaId}`;
            socket.join(room);
            logger_1.logger.info(`Socket ${socket.id} se unió a sala ${room}`);
            socket.emit('conectado:mesa', { room, mesaId });
        });
        // Unirse a sala de cocina (KDS)
        socket.on('unirse:cocina', () => {
            socket.join('cocina');
            logger_1.logger.info(`Socket ${socket.id} se unió a sala 'cocina'`);
            socket.emit('conectado:cocina', { ok: true });
        });
        // Unirse a sala de caja / administración
        socket.on('unirse:caja', () => {
            socket.join('caja');
            logger_1.logger.info(`Socket ${socket.id} se unió a sala 'caja'`);
            socket.emit('conectado:caja', { ok: true });
        });
        socket.on('disconnect', (reason) => {
            logger_1.logger.debug(`Socket desconectado: ${socket.id} (${reason})`);
        });
    });
    ioInstance = io;
    return io;
}
function getIO() {
    return ioInstance;
}
exports.socketEmitter = {
    emitNuevoPedido(pedido) {
        if (!ioInstance)
            return;
        logger_1.logger.info(`Emitiendo 'pedido:nuevo' para pedido #${pedido.codigo} a 'cocina' y 'caja'`);
        ioInstance.to('cocina').to('caja').emit('pedido:nuevo', pedido);
        ioInstance.to(`mesa:${pedido.mesa_id}`).emit('pedido:estado', pedido);
    },
    emitEstadoPedido(pedido) {
        if (!ioInstance)
            return;
        logger_1.logger.info(`Emitiendo 'pedido:estado' [${pedido.estado}] para pedido #${pedido.codigo}`);
        ioInstance.to(`mesa:${pedido.mesa_id}`).emit('pedido:estado', pedido);
        ioInstance.to('cocina').to('caja').emit('pedido:estado', pedido);
    },
    emitEstadoMesa(mesaId, estado) {
        if (!ioInstance)
            return;
        logger_1.logger.info(`Emitiendo 'mesa:estado' [${estado}] para mesa #${mesaId}`);
        ioInstance.to('caja').emit('mesa:estado', { mesaId, estado });
    },
    emitReservaActualizada(reserva) {
        if (!ioInstance)
            return;
        logger_1.logger.info(`Emitiendo 'reserva:actualizada' para reserva #${reserva.id}`);
        ioInstance.to('caja').emit('reserva:actualizada', reserva);
    },
    emitEsperaActualizada(item) {
        if (!ioInstance)
            return;
        logger_1.logger.info(`Emitiendo 'espera:actualizada' para lista de espera #${item.id}`);
        ioInstance.to('caja').emit('espera:actualizada', item);
    },
};
