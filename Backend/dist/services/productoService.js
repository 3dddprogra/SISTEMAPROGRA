"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productoService = exports.categoriaService = void 0;
const categoriaRepository_1 = require("../repositories/categoriaRepository");
const productoRepository_1 = require("../repositories/productoRepository");
exports.categoriaService = {
    async getCategorias() {
        return categoriaRepository_1.categoriaRepository.findAll();
    },
    async getCategoriaById(id) {
        const categoria = await categoriaRepository_1.categoriaRepository.findById(id);
        if (!categoria) {
            throw { statusCode: 404, code: 'NOT_FOUND', message: `Categoría con ID ${id} no encontrada.` };
        }
        return categoria;
    },
};
exports.productoService = {
    async getProductos(categoriaId) {
        return productoRepository_1.productoRepository.findAll(categoriaId);
    },
    async getProductosDisponibles() {
        return productoRepository_1.productoRepository.findDisponibles();
    },
    async getProductoById(id) {
        const producto = await productoRepository_1.productoRepository.findById(id);
        if (!producto) {
            throw { statusCode: 404, code: 'NOT_FOUND', message: `Producto con ID ${id} no encontrado.` };
        }
        return producto;
    },
    async updateDisponibilidad(id, disponible) {
        const producto = await productoRepository_1.productoRepository.findById(id);
        if (!producto) {
            throw { statusCode: 404, code: 'NOT_FOUND', message: `Producto con ID ${id} no encontrado.` };
        }
        await productoRepository_1.productoRepository.updateDisponibilidad(id, disponible);
        return { ...producto, disponible };
    },
};
