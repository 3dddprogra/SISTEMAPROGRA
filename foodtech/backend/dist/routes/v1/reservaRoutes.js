"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const reservaController_1 = require("../../controllers/reservaController");
const auth_1 = require("../../middleware/auth");
const validate_1 = require("../../middleware/validate");
const router = (0, express_1.Router)();
const crearReservaSchema = zod_1.z.object({
    mesa_id: zod_1.z.number().int().positive(),
    cliente_nombre: zod_1.z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    cliente_telefono: zod_1.z.string().min(6, 'Teléfono inválido'),
    cliente_email: zod_1.z.string().email().optional().nullable(),
    num_personas: zod_1.z.number().int().positive(),
    fecha_hora: zod_1.z.string().min(10, 'Fecha y hora requerida'),
    notas: zod_1.z.string().optional().nullable(),
});
const updateEstadoSchema = zod_1.z.object({
    estado: zod_1.z.enum(['pendiente', 'confirmada', 'cancelada', 'completada']),
});
router.get('/', reservaController_1.reservaController.getReservas);
router.post('/', (0, validate_1.validateBody)(crearReservaSchema), reservaController_1.reservaController.crearReserva);
router.patch('/:id/estado', auth_1.authenticateStaff, (0, auth_1.requireRoles)('cajero', 'admin'), (0, validate_1.validateBody)(updateEstadoSchema), reservaController_1.reservaController.actualizarEstado);
exports.default = router;
