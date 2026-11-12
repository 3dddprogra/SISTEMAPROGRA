import { Router } from 'express';
import { z } from 'zod';
import { listaEsperaController } from '../../controllers/listaEsperaController';
import { authenticateStaff, requireRoles } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';

const router = Router();

const crearEsperaSchema = z.object({
  cliente_nombre: z.string().min(2, 'Nombre requerido'),
  telefono: z.string().min(6, 'Teléfono requerido'),
  num_personas: z.number().int().positive(),
  tiempo_estimado_espera: z.number().int().positive().optional(),
  notas: z.string().optional().nullable(),
});

const updateEstadoSchema = z.object({
  estado: z.enum(['esperando', 'notificado', 'sentado', 'cancelado']),
  mesa_id: z.number().int().positive().optional().nullable(),
});

const sentarSchema = z.object({
  mesa_id: z.number().int().positive(),
});

router.get('/', listaEsperaController.getLista);
router.post('/', validateBody(crearEsperaSchema), listaEsperaController.agregar);
router.patch(
  '/:id/estado',
  authenticateStaff,
  requireRoles('cajero', 'admin'),
  validateBody(updateEstadoSchema),
  listaEsperaController.actualizarEstado
);
router.post(
  '/:id/sentar',
  authenticateStaff,
  requireRoles('cajero', 'admin'),
  validateBody(sentarSchema),
  listaEsperaController.sentarCliente
);

export default router;
