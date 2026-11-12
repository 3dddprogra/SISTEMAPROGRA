import { RowDataPacket } from 'mysql2';
import { pool } from '../config/database';
import { Usuario } from '../types';

export const usuarioRepository = {
  async findByEmail(email: string): Promise<Usuario | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, nombre, email, password_hash, rol, activo, creado_en, actualizado_en FROM usuarios WHERE email = ? LIMIT 1',
      [email]
    );
    return (rows[0] as Usuario) || null;
  },

  async findById(id: number): Promise<Usuario | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, nombre, email, rol, activo, creado_en, actualizado_en FROM usuarios WHERE id = ? LIMIT 1',
      [id]
    );
    return (rows[0] as Usuario) || null;
  },

  async findAll(): Promise<Omit<Usuario, 'password_hash'>[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, nombre, email, rol, activo, creado_en, actualizado_en FROM usuarios ORDER BY id ASC'
    );
    return rows as Omit<Usuario, 'password_hash'>[];
  },
};
