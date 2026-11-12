"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoriaRepository = void 0;
const database_1 = require("../config/database");
exports.categoriaRepository = {
    async findAll() {
        const [rows] = await database_1.pool.query('SELECT id, nombre, descripcion, icono, orden, activo, creado_en FROM categorias WHERE activo = TRUE ORDER BY orden ASC');
        return rows;
    },
    async findById(id) {
        const [rows] = await database_1.pool.query('SELECT id, nombre, descripcion, icono, orden, activo, creado_en FROM categorias WHERE id = ? LIMIT 1', [id]);
        return rows[0] || null;
    },
    async create(data) {
        const [result] = await database_1.pool.query('INSERT INTO categorias (nombre, descripcion, icono, orden, activo) VALUES (?, ?, ?, ?, ?)', [data.nombre, data.descripcion || null, data.icono || null, data.orden || 0, data.activo ?? true]);
        return result.insertId;
    },
};
