"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const authController_1 = require("../../controllers/authController");
const auth_1 = require("../../middleware/auth");
const validate_1 = require("../../middleware/validate");
const rateLimiter_1 = require("../../middleware/rateLimiter");
const router = (0, express_1.Router)();
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Debe proporcionar un correo electrónico válido'),
    password: zod_1.z.string().min(4, 'La contraseña debe tener al menos 4 caracteres'),
});
router.post('/login', rateLimiter_1.authRateLimiter, (0, validate_1.validateBody)(loginSchema), authController_1.authController.login);
router.get('/me', auth_1.authenticateStaff, authController_1.authController.me);
router.get('/mesa-token/:mesaId', authController_1.authController.getMesaToken);
exports.default = router;
