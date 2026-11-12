"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.facturacionRepository = void 0;
const database_1 = require("../config/database");
exports.facturacionRepository = {
    async getResumen() {
        // 1. Totales de pedidos pagados
        const [totalsRows] = await database_1.pool.query(`SELECT
         COALESCE(SUM(total), 0) AS ingresosTotales,
         COUNT(*) AS pedidosCompletados,
         COALESCE(AVG(total), 0) AS ticketPromedio
       FROM pedidos
       WHERE estado = 'pagado'`);
        const [todayRows] = await database_1.pool.query(`SELECT COUNT(*) AS pedidosHoy
       FROM pedidos
       WHERE DATE(creado_en) = CURDATE()`);
        // 2. Desglose por método de pago
        const [paymentRows] = await database_1.pool.query(`SELECT
         COALESCE(metodo_pago, 'efectivo') AS metodo,
         COALESCE(SUM(total), 0) AS total,
         COUNT(*) AS cantidad
       FROM pedidos
       WHERE estado = 'pagado'
       GROUP BY metodo_pago`);
        // 3. Top 5 productos más vendidos
        const [topProductRows] = await database_1.pool.query(`SELECT
         pr.nombre,
         SUM(d.cantidad) AS cantidad,
         SUM(d.subtotal) AS total
       FROM detalle_pedidos d
       INNER JOIN productos pr ON d.producto_id = pr.id
       INNER JOIN pedidos p ON d.pedido_id = p.id
       WHERE p.estado = 'pagado'
       GROUP BY pr.id, pr.nombre
       ORDER BY cantidad DESC
       LIMIT 5`);
        return {
            ingresosTotales: parseFloat(totalsRows[0]?.ingresosTotales || '0'),
            pedidosCompletados: parseInt(totalsRows[0]?.pedidosCompletados || '0', 10),
            ticketPromedio: parseFloat(totalsRows[0]?.ticketPromedio || '0'),
            pedidosHoy: parseInt(todayRows[0]?.pedidosHoy || '0', 10),
            metodosPago: paymentRows.map(r => ({
                metodo: r.metodo,
                total: parseFloat(r.total),
                cantidad: parseInt(r.cantidad, 10),
            })),
            topProductos: topProductRows.map(r => ({
                nombre: r.nombre,
                cantidad: parseInt(r.cantidad, 10),
                total: parseFloat(r.total),
            })),
        };
    },
};
