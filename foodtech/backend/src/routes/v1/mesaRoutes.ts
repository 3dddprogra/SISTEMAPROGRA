import { Router } from 'express';
import { z } from 'zod';
import { mesaController } from '../../controllers/mesaController';
import { authenticateStaff, requireRoles } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';

const router = Router();

const updateEstadoSchema = z.object({
  estado: z.enum(['disponible', 'ocupada', 'reservada', 'inactiva']),
});

// Clientes y personal pueden ver mesas
router.get('/', mesaController.getMesas);
router.get('/:id', mesaController.getMesaById);

// Solo cajero o admin pueden cambiar estado manual de mesa
router.patch(
  '/:id/estado',
  authenticateStaff,
  requireRoles('cajero', 'admin'),
  validateBody(updateEstadoSchema),
  mesaController.updateEstado
);

export default router;
