"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usuarioRepository = void 0;
const database_1 = require("../config/database");
exports.usuarioRepository = {
    async findByEmail(email) {
        const [rows] = await database_1.pool.query('SELECT id, nombre, email, password_hash, rol, activo, creado_en, actualizado_en FROM usuarios WHERE email = ? LIMIT 1', [email]);
        return rows[0] || null;
    },
    async findById(id) {
        const [rows] = await database_1.pool.query('SELECT id, nombre, email, rol, activo, creado_en, actualizado_en FROM usuarios WHERE id = ? LIMIT 1', [id]);
        return rows[0] || null;
    },
    async findAll() {
        const [rows] = await database_1.pool.query('SELECT id, nombre, email, rol, activo, creado_en, actualizado_en FROM usuarios ORDER BY id ASC');
        return rows;
    },
};
