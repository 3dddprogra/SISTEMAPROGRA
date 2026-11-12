"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productoController = exports.categoriaController = void 0;
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
exports.productoController = {
    async getProductos(req, res, next) {
        try {
            const categoriaId = req.query.categoriaId ? parseInt(req.query.categoriaId, 10) : undefined;
            const productos = await productoService_1.productoService.getProductos(categoriaId);
            res.status(200).json({ success: true, data: productos });
        }
        catch (err) {
            next(err);
        }
    },
    async getDisponibles(_req, res, next) {
        try {
            const productos = await productoService_1.productoService.getProductosDisponibles();
            res.status(200).json({ success: true, data: productos });
        }
        catch (err) {
            next(err);
        }
    },
    async getProductoById(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const producto = await productoService_1.productoService.getProductoById(id);
            res.status(200).json({ success: true, data: producto });
        }
        catch (err) {
            next(err);
        }
    },
    async updateDisponibilidad(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const { disponible } = req.body;
            const updated = await productoService_1.productoService.updateDisponibilidad(id, disponible);
            res.status(200).json({ success: true, data: updated });
        }
        catch (err) {
            next(err);
        }
    },
};
