"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reservaRepository = void 0;
const database_1 = require("../config/database");
exports.reservaRepository = {
    async findAll() {
        const [rows] = await database_1.pool.query(`SELECT r.id, r.mesa_id, m.numero AS numero_mesa, r.cliente_nombre, r.cliente_telefono,
              r.cliente_email, r.num_personas, r.fecha_hora, r.estado, r.notas,
              r.creado_en, r.actualizado_en
       FROM reservas r
       INNER JOIN mesas m ON r.mesa_id = m.id
       ORDER BY r.fecha_hora ASC`);
        return rows;
    },
    async findById(id) {
        const [rows] = await database_1.pool.query(`SELECT r.id, r.mesa_id, m.numero AS numero_mesa, r.cliente_nombre, r.cliente_telefono,
              r.cliente_email, r.num_personas, r.fecha_hora, r.estado, r.notas,
              r.creado_en, r.actualizado_en
       FROM reservas r
       INNER JOIN mesas m ON r.mesa_id = m.id
       WHERE r.id = ? LIMIT 1`, [id]);
        return rows[0] || null;
    },
    async create(data) {
        const [result] = await database_1.pool.query(`INSERT INTO reservas (mesa_id, cliente_nombre, cliente_telefono, cliente_email, num_personas, fecha_hora, estado, notas)
       VALUES (?, ?, ?, ?, ?, 'confirmada', ?)`, [
            data.mesa_id,
            data.cliente_nombre,
            data.cliente_telefono,
            data.cliente_email || null,
            data.num_personas,
            data.fecha_hora,
            data.notas || null,
        ]);
        // Opcionalmente actualizar estado de mesa a 'reservada'
        await database_1.pool.query('UPDATE mesas SET estado = "reservada" WHERE id = ? AND estado = "disponible"', [data.mesa_id]);
        return result.insertId;
    },
    async updateEstado(id, estado) {
        const [result] = await database_1.pool.query('UPDATE reservas SET estado = ? WHERE id = ?', [estado, id]);
        return result.affectedRows > 0;
    },
};
