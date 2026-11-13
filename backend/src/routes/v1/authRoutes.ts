import { Router } from 'express';
import { z } from 'zod';
import { authController } from '../../controllers/authController';
import { authenticateStaff } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { authRateLimiter } from '../../middleware/rateLimiter';

const router = Router();

const loginSchema = z.object({
  email: z.string().email('Debe proporcionar un correo electrónico válido'),
  password: z.string().min(4, 'La contraseña debe tener al menos 4 caracteres'),
});

router.post('/login', authRateLimiter, validateBody(loginSchema), authController.login);
router.get('/me', authenticateStaff, authController.me);
router.get('/mesa-token/:mesaId', authController.getMesaToken);

export default router;
