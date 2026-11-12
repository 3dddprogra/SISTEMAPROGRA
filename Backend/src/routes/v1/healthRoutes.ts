import { Router } from 'express';
import { healthController } from '../../controllers/healthController';

const router = Router();

// GET /api/v1/health - Comprueba la conexión a MySQL y el estado del backend
router.get('/', healthController.checkHealth);

export default router;
