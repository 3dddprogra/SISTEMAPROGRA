import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/database';
import { EstadoListaEspera, ListaEspera } from '../types';

export const listaEsperaRepository = {
  async findAll(): Promise<ListaEspera[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT le.id, le.cliente_nombre, le.telefono, le.num_personas, le.posicion,
              le.estado, le.mesa_asignada_id, m.numero AS numero_mesa, le.hora_llegada,
              le.tiempo_estimado_espera, le.notas, le.actualizado_en
       FROM lista_espera le
       LEFT JOIN mesas m ON le.mesa_asignada_id = m.id
       ORDER BY CASE WHEN le.estado = 'esperando' THEN 1 WHEN le.estado = 'notificado' THEN 2 ELSE 3 END,
                le.posicion ASC, le.hora_llegada ASC`
    );
    return rows as ListaEspera[];
  },

  async create(data: {
    cliente_nombre: string;
    telefono: string;
    num_personas: number;
    tiempo_estimado_espera?: number;
    notas?: string | null;
  }): Promise<number> {
    // Determinar siguiente posición
    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM lista_espera WHERE estado = 'esperando'`
    );
    const nextPos = (countRows[0]?.total || 0) + 1;

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO lista_espera (cliente_nombre, telefono, num_personas, posicion, estado, tiempo_estimado_espera, notas)
       VALUES (?, ?, ?, ?, 'esperando', ?, ?)`,
      [
        data.cliente_nombre,
        data.telefono,
        data.num_personas,
        nextPos,
        data.tiempo_estimado_espera || 20,
        data.notas || null,
      ]
    );
    return result.insertId;
  },

  async updateEstado(id: number, estado: EstadoListaEspera, mesaId?: number | null): Promise<boolean> {
    let query = 'UPDATE lista_espera SET estado = ?';
    const params: unknown[] = [estado];

    if (mesaId !== undefined) {
      query += ', mesa_asignada_id = ?';
      params.push(mesaId);
    }

    query += ' WHERE id = ?';
    params.push(id);

    const [result] = await pool.query<ResultSetHeader>(query, params);
    return result.affectedRows > 0;
  },
};
