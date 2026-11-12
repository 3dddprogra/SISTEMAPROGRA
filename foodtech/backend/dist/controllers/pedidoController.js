"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pedidoController = void 0;
const pedidoService_1 = require("../services/pedidoService");
exports.pedidoController = {
    async crearPedido(req, res, next) {
        try {
            const { mesa_id, notas, items } = req.body;
            const usuario_id = req.user ? req.user.id : null;
            const pedido = await pedidoService_1.pedidoService.crearPedido({
                mesa_id,
                usuario_id,
                notas,
                items,
            });
            res.status(201).json({
                success: true,
                data: pedido,
            });
        }
        catch (err) {
            next(err);
        }
    },
    async getPedidos(req, res, next) {
        try {
            const estado = req.query.estado;
            const mesaId = req.query.mesaId ? parseInt(req.query.mesaId, 10) : undefined;
            const pedidos = await pedidoService_1.pedidoService.getPedidos({ estado, mesaId });
            res.status(200).json({
                success: true,
                data: pedidos,
            });
        }
        catch (err) {
            next(err);
        }
    },
    async getPedidoById(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const pedido = await pedidoService_1.pedidoService.getPedidoById(id);
            res.status(200).json({
                success: true,
                data: pedido,
            });
        }
        catch (err) {
            next(err);
        }
    },
    async getActivoMesa(req, res, next) {
        try {
            const mesaId = parseInt(req.params.mesaId, 10);
            const pedido = await pedidoService_1.pedidoService.getPedidoActivoMesa(mesaId);
            res.status(200).json({
                success: true,
                data: pedido,
            });
        }
        catch (err) {
            next(err);
        }
    },
    async actualizarEstado(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const { estado } = req.body;
            const pedidoActualizado = await pedidoService_1.pedidoService.actualizarEstado(id, estado);
            res.status(200).json({
                success: true,
                data: pedidoActualizado,
            });
        }
        catch (err) {
            next(err);
        }
    },
    async cobrarPedido(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const { metodo_pago } = req.body;
            const pedidoCobrado = await pedidoService_1.pedidoService.cobrarPedido(id, metodo_pago);
            res.status(200).json({
                success: true,
                data: pedidoCobrado,
            });
        }
        catch (err) {
            next(err);
        }
    },
};
