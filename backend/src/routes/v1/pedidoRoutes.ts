import { Router } from 'express';
import { z } from 'zod';
import { pedidoController } from '../../controllers/pedidoController';
import { authenticateStaff, requireRoles, authenticateMesaOrStaff } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';

const router = Router();

const crearPedidoSchema = z.object({
  mesa_id: z.number().int().positive('El ID de mesa debe ser un número entero positivo'),
  notas: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        producto_id: z.number().int().positive('ID de producto inválido'),
        cantidad: z.number().int().positive('La cantidad debe ser al menos 1'),
        notas: z.string().optional().nullable(),
      })
    )
    .min(1, 'El pedido debe tener al menos un producto'),
});

const cambiarEstadoSchema = z.object({
  estado: z.enum(['en_proceso', 'terminado', 'entregado', 'cancelado']),
});

const cobrarPedidoSchema = z.object({
  metodo_pago: z.enum(['efectivo', 'qr']),
});

// Crear pedido: Clientes con QR o personal del restaurante
router.post('/', authenticateMesaOrStaff, validateBody(crearPedidoSchema), pedidoController.crearPedido);

// Listar pedidos y ver detalles
// El listado general y el detalle son SOLO para el personal (caja, cocina, admin).
// El cliente únicamente consulta el pedido activo de su propia mesa para el seguimiento.
router.get('/', authenticateStaff, requireRoles('cajero', 'cocina', 'admin'), pedidoController.getPedidos);
router.get('/mesa/:mesaId/activo', pedidoController.getActivoMesa);
router.get('/:id', authenticateStaff, requireRoles('cajero', 'cocina', 'admin'), pedidoController.getPedidoById);

// Cambiar estado del pedido (cocina o personal)
router.patch(
  '/:id/estado',
  authenticateStaff,
  requireRoles('cocina', 'cajero', 'admin'),
  validateBody(cambiarEstadoSchema),
  pedidoController.actualizarEstado
);

// Cobro de pedido (caja o admin)
router.post(
  '/:id/cobrar',
  authenticateStaff,
  requireRoles('cajero', 'admin'),
  validateBody(cobrarPedidoSchema),
  pedidoController.cobrarPedido
);

export default router;
