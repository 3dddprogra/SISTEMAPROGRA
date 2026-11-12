import { Router } from 'express';
import { z } from 'zod';
import { reservaController } from '../../controllers/reservaController';
import { authenticateStaff, requireRoles } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';

const router = Router();

const crearReservaSchema = z.object({
  mesa_id: z.number().int().positive(),
  cliente_nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  cliente_telefono: z.string().min(6, 'Teléfono inválido'),
  cliente_email: z.string().email().optional().nullable(),
  num_personas: z.number().int().positive(),
  fecha_hora: z.string().min(10, 'Fecha y hora requerida'),
  notas: z.string().optional().nullable(),
});

const updateEstadoSchema = z.object({
  estado: z.enum(['pendiente', 'confirmada', 'cancelada', 'completada']),
});

router.get('/', reservaController.getReservas);
router.post('/', validateBody(crearReservaSchema), reservaController.crearReserva);
router.patch(
  '/:id/estado',
  authenticateStaff,
  requireRoles('cajero', 'admin'),
  validateBody(updateEstadoSchema),
  reservaController.actualizarEstado
);

export default router;
