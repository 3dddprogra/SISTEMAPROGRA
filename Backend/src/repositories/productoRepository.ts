import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/database';
import { Producto } from '../types';

export const productoRepository = {
  async findAll(categoriaId?: number): Promise<Producto[]> {
    let query = `
      SELECT p.id, p.categoria_id, p.nombre, p.descripcion, p.precio, p.imagen_url,
             p.disponible, p.tiempo_estimado_min, p.creado_en, p.actualizado_en,
             c.nombre AS categoria_nombre
      FROM productos p
      INNER JOIN categorias c ON p.categoria_id = c.id
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (categoriaId) {
      query += ' AND p.categoria_id = ?';
      params.push(categoriaId);
    }

    query += ' ORDER BY p.categoria_id ASC, p.nombre ASC';
    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    return rows.map(r => ({
      ...r,
      precio: parseFloat(r.precio),
    })) as Producto[];
  },

  async findDisponibles(): Promise<Producto[]> {
    const query = `
      SELECT p.id, p.categoria_id, p.nombre, p.descripcion, p.precio, p.imagen_url,
             p.disponible, p.tiempo_estimado_min, p.creado_en, p.actualizado_en,
             c.nombre AS categoria_nombre
      FROM productos p
      INNER JOIN categorias c ON p.categoria_id = c.id
      WHERE p.disponible = TRUE
      ORDER BY c.orden ASC, p.nombre ASC
    `;
    const [rows] = await pool.query<RowDataPacket[]>(query);
    return rows.map(r => ({
      ...r,
      precio: parseFloat(r.precio),
    })) as Producto[];
  },

  async findById(id: number): Promise<Producto | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT p.id, p.categoria_id, p.nombre, p.descripcion, p.precio, p.imagen_url,
              p.disponible, p.tiempo_estimado_min, p.creado_en, p.actualizado_en,
              c.nombre AS categoria_nombre
       FROM productos p
       INNER JOIN categorias c ON p.categoria_id = c.id
       WHERE p.id = ? LIMIT 1`,
      [id]
    );
    if (!rows[0]) return null;
    return {
      ...(rows[0] as Producto),
      precio: parseFloat(rows[0].precio),
    };
  },

  async updateDisponibilidad(id: number, disponible: boolean): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE productos SET disponible = ? WHERE id = ?',
      [disponible, id]
    );
    return result.affectedRows > 0;
  },
};
