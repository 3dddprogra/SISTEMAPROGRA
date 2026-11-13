import { Router } from 'express';
import { facturacionController } from '../../controllers/facturacionController';
import { authenticateStaff, requireRoles } from '../../middleware/auth';

const router = Router();

router.get(
  '/resumen',
  authenticateStaff,
  requireRoles('cajero', 'admin'),
  facturacionController.getResumen
);

export default router;
