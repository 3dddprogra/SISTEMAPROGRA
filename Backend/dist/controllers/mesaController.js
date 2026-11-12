"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mesaController = void 0;
const mesaService_1 = require("../services/mesaService");
exports.mesaController = {
    async getMesas(_req, res, next) {
        try {
            const mesas = await mesaService_1.mesaService.getMesas();
            res.status(200).json({ success: true, data: mesas });
        }
        catch (err) {
            next(err);
        }
    },
    async getMesaById(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const mesa = await mesaService_1.mesaService.getMesaById(id);
            res.status(200).json({ success: true, data: mesa });
        }
        catch (err) {
            next(err);
        }
    },
    async updateEstado(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const { estado } = req.body;
            const updated = await mesaService_1.mesaService.updateEstado(id, estado);
            res.status(200).json({ success: true, data: updated });
        }
        catch (err) {
            next(err);
        }
    },
};
