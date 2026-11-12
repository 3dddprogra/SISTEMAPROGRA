import { Router } from 'express';
import { z } from 'zod';
import { productoController } from '../../controllers/productoController';
import { authenticateStaff, requireRoles } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';

const router = Router();

const updateDisponibilidadSchema = z.object({
  disponible: z.boolean(),
});

router.get('/', productoController.getProductos);
router.get('/disponibles', productoController.getDisponibles);
router.get('/:id', productoController.getProductoById);

// Cocina o Admin pueden pausar/activar productos si se agotan
router.patch(
  '/:id/disponibilidad',
  authenticateStaff,
  requireRoles('cocina', 'admin', 'cajero'),
  validateBody(updateDisponibilidadSchema),
  productoController.updateDisponibilidad
);

export default router;
