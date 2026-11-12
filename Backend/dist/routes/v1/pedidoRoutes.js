"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const pedidoController_1 = require("../../controllers/pedidoController");
const auth_1 = require("../../middleware/auth");
const validate_1 = require("../../middleware/validate");
const router = (0, express_1.Router)();
const crearPedidoSchema = zod_1.z.object({
    mesa_id: zod_1.z.number().int().positive('El ID de mesa debe ser un número entero positivo'),
    notas: zod_1.z.string().optional().nullable(),
    items: zod_1.z
        .array(zod_1.z.object({
        producto_id: zod_1.z.number().int().positive('ID de producto inválido'),
        cantidad: zod_1.z.number().int().positive('La cantidad debe ser al menos 1'),
        notas: zod_1.z.string().optional().nullable(),
    }))
        .min(1, 'El pedido debe tener al menos un producto'),
});
const cambiarEstadoSchema = zod_1.z.object({
    estado: zod_1.z.enum(['pendiente', 'en_proceso', 'terminado', 'entregado', 'pagado', 'cancelado']),
});
const cobrarPedidoSchema = zod_1.z.object({
    metodo_pago: zod_1.z.enum(['efectivo', 'tarjeta', 'qr', 'transferencia']),
});
// Crear pedido: Clientes con QR o personal del restaurante
router.post('/', auth_1.authenticateMesaOrStaff, (0, validate_1.validateBody)(crearPedidoSchema), pedidoController_1.pedidoController.crearPedido);
// Listar pedidos y ver detalles
router.get('/', pedidoController_1.pedidoController.getPedidos);
router.get('/mesa/:mesaId/activo', pedidoController_1.pedidoController.getActivoMesa);
router.get('/:id', pedidoController_1.pedidoController.getPedidoById);
// Cambiar estado del pedido (cocina o personal)
router.patch('/:id/estado', auth_1.authenticateStaff, (0, auth_1.requireRoles)('cocina', 'cajero', 'admin'), (0, validate_1.validateBody)(cambiarEstadoSchema), pedidoController_1.pedidoController.actualizarEstado);
// Cobro de pedido (caja o admin)
router.post('/:id/cobrar', auth_1.authenticateStaff, (0, auth_1.requireRoles)('cajero', 'admin'), (0, validate_1.validateBody)(cobrarPedidoSchema), pedidoController_1.pedidoController.cobrarPedido);
exports.default = router;
