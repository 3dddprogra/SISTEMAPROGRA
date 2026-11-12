"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productoRepository = void 0;
const database_1 = require("../config/database");
exports.productoRepository = {
    async findAll(categoriaId) {
        let query = `
      SELECT p.id, p.categoria_id, p.nombre, p.descripcion, p.precio, p.imagen_url,
             p.disponible, p.tiempo_estimado_min, p.creado_en, p.actualizado_en,
             c.nombre AS categoria_nombre
      FROM productos p
      INNER JOIN categorias c ON p.categoria_id = c.id
      WHERE 1=1
    `;
        const params = [];
        if (categoriaId) {
            query += ' AND p.categoria_id = ?';
            params.push(categoriaId);
        }
        query += ' ORDER BY p.categoria_id ASC, p.nombre ASC';
        const [rows] = await database_1.pool.query(query, params);
        return rows.map(r => ({
            ...r,
            precio: parseFloat(r.precio),
        }));
    },
    async findDisponibles() {
        const query = `
      SELECT p.id, p.categoria_id, p.nombre, p.descripcion, p.precio, p.imagen_url,
             p.disponible, p.tiempo_estimado_min, p.creado_en, p.actualizado_en,
             c.nombre AS categoria_nombre
      FROM productos p
      INNER JOIN categorias c ON p.categoria_id = c.id
      WHERE p.disponible = TRUE
      ORDER BY c.orden ASC, p.nombre ASC
    `;
        const [rows] = await database_1.pool.query(query);
        return rows.map(r => ({
            ...r,
            precio: parseFloat(r.precio),
        }));
    },
    async findById(id) {
        const [rows] = await database_1.pool.query(`SELECT p.id, p.categoria_id, p.nombre, p.descripcion, p.precio, p.imagen_url,
              p.disponible, p.tiempo_estimado_min, p.creado_en, p.actualizado_en,
              c.nombre AS categoria_nombre
       FROM productos p
       INNER JOIN categorias c ON p.categoria_id = c.id
       WHERE p.id = ? LIMIT 1`, [id]);
        if (!rows[0])
            return null;
        return {
            ...rows[0],
            precio: parseFloat(rows[0].precio),
        };
    },
    async updateDisponibilidad(id, disponible) {
        const [result] = await database_1.pool.query('UPDATE productos SET disponible = ? WHERE id = ?', [disponible, id]);
        return result.affectedRows > 0;
    },
};
