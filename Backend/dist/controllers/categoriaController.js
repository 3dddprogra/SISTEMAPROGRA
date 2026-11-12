"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoriaController = void 0;
const productoService_1 = require("../services/productoService");
exports.categoriaController = {
    async getCategorias(_req, res, next) {
        try {
            const categorias = await productoService_1.categoriaService.getCategorias();
            res.status(200).json({ success: true, data: categorias });
        }
        catch (err) {
            next(err);
        }
    },
    async getCategoriaById(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const categoria = await productoService_1.categoriaService.getCategoriaById(id);
            res.status(200).json({ success: true, data: categoria });
        }
        catch (err) {
            next(err);
        }
    },
};
