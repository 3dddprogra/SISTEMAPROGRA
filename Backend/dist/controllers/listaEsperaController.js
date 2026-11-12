"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listaEsperaController = void 0;
const listaEsperaService_1 = require("../services/listaEsperaService");
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
