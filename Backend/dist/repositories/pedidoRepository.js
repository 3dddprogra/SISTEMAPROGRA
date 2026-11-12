"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pedidoRepository = void 0;
const database_1 = require("../config/database");
exports.pedidoRepository = {
    // Transacción atómica: se ejecuta pasando la conexión activa
    async createInTransaction(conn, pedido, detalles) {
        const [orderResult] = await conn.query(`INSERT INTO pedidos (mesa_id, usuario_id, codigo, estado, total, notas)
       VALUES (?, ?, ?, ?, ?, ?)`, [
            pedido.mesa_id,
            pedido.usuario_id || null,
            pedido.codigo,
            pedido.estado,
            pedido.total,
            pedido.notas || null,
        ]);
        const pedidoId = orderResult.insertId;
        for (const item of detalles) {
            await conn.query(`INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_unitario, subtotal, notas)
         VALUES (?, ?, ?, ?, ?, ?)`, [
                pedidoId,
                item.producto_id,
                item.cantidad,
                item.precio_unitario,
                item.subtotal,
                item.notas || null,
            ]);
        }
        // Actualizar estado de la mesa a 'ocupada'
        await conn.query(`UPDATE mesas SET estado = 'ocupada' WHERE id = ?`, [pedido.mesa_id]);
        return pedidoId;
    },
    async findById(id) {
        const [rows] = await database_1.pool.query(`SELECT p.id, p.mesa_id, m.numero AS numero_mesa, p.usuario_id, u.nombre AS usuario_nombre,
              p.codigo, p.estado, p.total, p.metodo_pago, p.notas, p.creado_en, p.actualizado_en
       FROM pedidos p
       INNER JOIN mesas m ON p.mesa_id = m.id
       LEFT JOIN usuarios u ON p.usuario_id = u.id
       WHERE p.id = ? LIMIT 1`, [id]);
        if (!rows[0])
            return null;
        const pedido = rows[0];
        pedido.total = parseFloat(pedido.total);
        // Obtener detalles con datos del producto
        const [detailRows] = await database_1.pool.query(`SELECT d.id, d.pedido_id, d.producto_id, pr.nombre AS nombre_producto,
              d.cantidad, d.precio_unitario, d.subtotal, d.notas
       FROM detalle_pedidos d
       INNER JOIN productos pr ON d.producto_id = pr.id
       WHERE d.pedido_id = ?
       ORDER BY d.id ASC`, [id]);
        pedido.detalles = detailRows.map(d => ({
            ...d,
            precio_unitario: parseFloat(d.precio_unitario),
            subtotal: parseFloat(d.subtotal),
        }));
        return pedido;
    },
    async findActiveByMesaId(mesaId) {
        const [rows] = await database_1.pool.query(`SELECT p.id
       FROM pedidos p
       WHERE p.mesa_id = ? AND p.estado NOT IN ('pagado', 'cancelado')
       ORDER BY p.id DESC
       LIMIT 1`, [mesaId]);
        if (!rows[0])
            return null;
        return this.findById(rows[0].id);
    },
    async findAll(filters) {
        let query = `
      SELECT p.id, p.mesa_id, m.numero AS numero_mesa, p.usuario_id, u.nombre AS usuario_nombre,
             p.codigo, p.estado, p.total, p.metodo_pago, p.notas, p.creado_en, p.actualizado_en
      FROM pedidos p
      INNER JOIN mesas m ON p.mesa_id = m.id
      LEFT JOIN usuarios u ON p.usuario_id = u.id
      WHERE 1=1
    `;
        const params = [];
        if (filters?.estado) {
            query += ' AND p.estado = ?';
            params.push(filters.estado);
        }
        if (filters?.mesaId) {
            query += ' AND p.mesa_id = ?';
            params.push(filters.mesaId);
        }
        query += ' ORDER BY p.id DESC';
        if (filters?.limit) {
            query += ' LIMIT ?';
            params.push(filters.limit);
        }
        else {
            query += ' LIMIT 100';
        }
        const [rows] = await database_1.pool.query(query, params);
        const pedidos = rows.map(r => ({
            ...r,
            total: parseFloat(r.total),
        }));
        // Enriquecer con items para KDS y Caja
        if (pedidos.length > 0) {
            const ids = pedidos.map(p => p.id);
            const [detailRows] = await database_1.pool.query(`SELECT d.id, d.pedido_id, d.producto_id, pr.nombre AS nombre_producto,
                d.cantidad, d.precio_unitario, d.subtotal, d.notas
         FROM detalle_pedidos d
         INNER JOIN productos pr ON d.producto_id = pr.id
         WHERE d.pedido_id IN (${ids.map(() => '?').join(',')})
         ORDER BY d.id ASC`, ids);
            const detailsByOrder = new Map();
            for (const d of detailRows) {
                const item = {
                    ...d,
                    precio_unitario: parseFloat(d.precio_unitario),
                    subtotal: parseFloat(d.subtotal),
                };
                const list = detailsByOrder.get(d.pedido_id) || [];
                list.push(item);
                detailsByOrder.set(d.pedido_id, list);
            }
            for (const p of pedidos) {
                p.detalles = detailsByOrder.get(p.id) || [];
            }
        }
        return pedidos;
    },
    async updateEstado(id, nuevoEstado) {
        const [result] = await database_1.pool.query('UPDATE pedidos SET estado = ? WHERE id = ?', [nuevoEstado, id]);
        return result.affectedRows > 0;
    },
    async cobrarPedido(id, metodoPago) {
        const [result] = await database_1.pool.query(`UPDATE pedidos SET estado = 'pagado', metodo_pago = ? WHERE id = ?`, [metodoPago, id]);
        return result.affectedRows > 0;
    },
};
