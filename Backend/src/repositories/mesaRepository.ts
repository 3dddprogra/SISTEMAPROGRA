import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/database';
import { EstadoMesa, Mesa } from '../types';

export const mesaRepository = {
  async findAll(): Promise<Mesa[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, numero, capacidad, estado, ubicacion, qr_token, creado_en, actualizado_en FROM mesas ORDER BY numero ASC'
    );
    return rows as Mesa[];
  },

  async findById(id: number): Promise<Mesa | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, numero, capacidad, estado, ubicacion, qr_token, creado_en, actualizado_en FROM mesas WHERE id = ? LIMIT 1',
      [id]
    );
    return (rows[0] as Mesa) || null;
  },

  async findByNumero(numero: number): Promise<Mesa | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, numero, capacidad, estado, ubicacion, qr_token, creado_en, actualizado_en FROM mesas WHERE numero = ? LIMIT 1',
      [numero]
    );
    return (rows[0] as Mesa) || null;
  },

  async updateEstado(id: number, estado: EstadoMesa): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE mesas SET estado = ? WHERE id = ?',
      [estado, id]
    );
    return result.affectedRows > 0;
  },

  async updateQrToken(id: number, qrToken: string): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE mesas SET qr_token = ? WHERE id = ?',
      [qrToken, id]
    );
    return result.affectedRows > 0;
  },
};
