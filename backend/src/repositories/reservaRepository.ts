import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/database';
import { EstadoReserva, Reserva } from '../types';

export const reservaRepository = {
  async findAll(): Promise<Reserva[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT r.id, r.mesa_id, m.numero AS numero_mesa, r.cliente_nombre, r.cliente_telefono,
              r.cliente_email, r.num_personas, r.fecha_hora, r.estado, r.notas,
              r.creado_en, r.actualizado_en
       FROM reservas r
       INNER JOIN mesas m ON r.mesa_id = m.id
       ORDER BY r.fecha_hora ASC`
    );
    return rows as Reserva[];
  },

  async findById(id: number): Promise<Reserva | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT r.id, r.mesa_id, m.numero AS numero_mesa, r.cliente_nombre, r.cliente_telefono,
              r.cliente_email, r.num_personas, r.fecha_hora, r.estado, r.notas,
              r.creado_en, r.actualizado_en
       FROM reservas r
       INNER JOIN mesas m ON r.mesa_id = m.id
       WHERE r.id = ? LIMIT 1`,
      [id]
    );
    return (rows[0] as Reserva) || null;
  },

  async create(data: {
    mesa_id: number;
    cliente_nombre: string;
    cliente_telefono: string;
    cliente_email?: string | null;
    num_personas: number;
    fecha_hora: string;
    notas?: string | null;
  }): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO reservas (mesa_id, cliente_nombre, cliente_telefono, cliente_email, num_personas, fecha_hora, estado, notas)
       VALUES (?, ?, ?, ?, ?, 'confirmada', ?)`,
      [
        data.mesa_id,
        data.cliente_nombre,
        data.cliente_telefono,
        data.cliente_email || null,
        data.num_personas,
        data.fecha_hora,
        data.notas || null,
      ]
    );

    // Opcionalmente actualizar estado de mesa a 'reservada'
    await pool.query('UPDATE mesas SET estado = "reservada" WHERE id = ? AND estado = "disponible"', [data.mesa_id]);

    return result.insertId;
  },

  async updateEstado(id: number, estado: EstadoReserva): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE reservas SET estado = ? WHERE id = ?',
      [estado, id]
    );
    return result.affectedRows > 0;
  },
};
