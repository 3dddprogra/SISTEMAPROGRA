"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.facturacionController = exports.listaEsperaController = exports.reservaController = void 0;
const reservaService_1 = require("../services/reservaService");
const listaEsperaService_1 = require("../services/listaEsperaService");
const facturacionService_1 = require("../services/facturacionService");
exports.reservaController = {
    async getReservas(_req, res, next) {
        try {
            const reservas = await reservaService_1.reservaService.getReservas();
            res.status(200).json({ success: true, data: reservas });
        }
        catch (err) {
            next(err);
        }
    },
    async crearReserva(req, res, next) {
        try {
            const { mesa_id, cliente_nombre, cliente_telefono, cliente_email, num_personas, fecha_hora, notas } = req.body;
            const reserva = await reservaService_1.reservaService.crearReserva({
                mesa_id,
                cliente_nombre,
                cliente_telefono,
                cliente_email,
                num_personas,
                fecha_hora,
                notas,
            });
            res.status(201).json({ success: true, data: reserva });
        }
        catch (err) {
            next(err);
        }
    },
    async actualizarEstado(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const { estado } = req.body;
            const reserva = await reservaService_1.reservaService.actualizarEstado(id, estado);
            res.status(200).json({ success: true, data: reserva });
        }
        catch (err) {
            next(err);
        }
    },
};
exports.listaEsperaController = {
    async getLista(_req, res, next) {
        try {
            const lista = await listaEsperaService_1.listaEsperaService.getLista();
            res.status(200).json({ success: true, data: lista });
        }
        catch (err) {
            next(err);
        }
    },
    async agregar(req, res, next) {
        try {
            const { cliente_nombre, telefono, num_personas, tiempo_estimado_espera, notas } = req.body;
            const item = await listaEsperaService_1.listaEsperaService.agregarCliente({
                cliente_nombre,
                telefono,
                num_personas,
                tiempo_estimado_espera,
                notas,
            });
            res.status(201).json({ success: true, data: item });
        }
        catch (err) {
            next(err);
        }
    },
    async actualizarEstado(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const { estado, mesa_id } = req.body;
            const item = await listaEsperaService_1.listaEsperaService.actualizarEstado(id, estado, mesa_id);
            res.status(200).json({ success: true, data: item });
        }
        catch (err) {
            next(err);
        }
    },
    async sentarCliente(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const { mesa_id } = req.body;
            const item = await listaEsperaService_1.listaEsperaService.sentarCliente(id, mesa_id);
            res.status(200).json({ success: true, data: item });
        }
        catch (err) {
            next(err);
        }
    },
};
exports.facturacionController = {
    async getResumen(_req, res, next) {
        try {
            const resumen = await facturacionService_1.facturacionService.getResumen();
            res.status(200).json({ success: true, data: resumen });
        }
        catch (err) {
            next(err);
        }
    },
};
