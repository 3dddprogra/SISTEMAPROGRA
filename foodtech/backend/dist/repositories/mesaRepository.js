"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mesaRepository = void 0;
const database_1 = require("../config/database");
exports.mesaRepository = {
    async findAll() {
        const [rows] = await database_1.pool.query('SELECT id, numero, capacidad, estado, ubicacion, qr_token, creado_en, actualizado_en FROM mesas ORDER BY numero ASC');
        return rows;
    },
    async findById(id) {
        const [rows] = await database_1.pool.query('SELECT id, numero, capacidad, estado, ubicacion, qr_token, creado_en, actualizado_en FROM mesas WHERE id = ? LIMIT 1', [id]);
        return rows[0] || null;
    },
    async findByNumero(numero) {
        const [rows] = await database_1.pool.query('SELECT id, numero, capacidad, estado, ubicacion, qr_token, creado_en, actualizado_en FROM mesas WHERE numero = ? LIMIT 1', [numero]);
        return rows[0] || null;
    },
    async updateEstado(id, estado) {
        const [result] = await database_1.pool.query('UPDATE mesas SET estado = ? WHERE id = ?', [estado, id]);
        return result.affectedRows > 0;
    },
    async updateQrToken(id, qrToken) {
        const [result] = await database_1.pool.query('UPDATE mesas SET qr_token = ? WHERE id = ?', [qrToken, id]);
        return result.affectedRows > 0;
    },
};
