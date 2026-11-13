import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/database';
import { Categoria } from '../types';

export const categoriaRepository = {
  async findAll(): Promise<Categoria[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, nombre, descripcion, icono, orden, activo, creado_en FROM categorias WHERE activo = TRUE ORDER BY orden ASC'
    );
    return rows as Categoria[];
  },

  async findById(id: number): Promise<Categoria | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, nombre, descripcion, icono, orden, activo, creado_en FROM categorias WHERE id = ? LIMIT 1',
      [id]
    );
    return (rows[0] as Categoria) || null;
  },

  async create(data: Omit<Categoria, 'id' | 'creado_en'>): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO categorias (nombre, descripcion, icono, orden, activo) VALUES (?, ?, ?, ?, ?)',
      [data.nombre, data.descripcion || null, data.icono || null, data.orden || 0, data.activo ?? true]
    );
    return result.insertId;
  },
};
