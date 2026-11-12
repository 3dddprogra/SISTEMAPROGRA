"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const listaEsperaController_1 = require("../../controllers/listaEsperaController");
const auth_1 = require("../../middleware/auth");
const validate_1 = require("../../middleware/validate");
const router = (0, express_1.Router)();
const crearEsperaSchema = zod_1.z.object({
    cliente_nombre: zod_1.z.string().min(2, 'Nombre requerido'),
    telefono: zod_1.z.string().min(6, 'Teléfono requerido'),
    num_personas: zod_1.z.number().int().positive(),
    tiempo_estimado_espera: zod_1.z.number().int().positive().optional(),
    notas: zod_1.z.string().optional().nullable(),
});
const updateEstadoSchema = zod_1.z.object({
    estado: zod_1.z.enum(['esperando', 'notificado', 'sentado', 'cancelado']),
    mesa_id: zod_1.z.number().int().positive().optional().nullable(),
});
const sentarSchema = zod_1.z.object({
    mesa_id: zod_1.z.number().int().positive(),
});
router.get('/', listaEsperaController_1.listaEsperaController.getLista);
router.post('/', (0, validate_1.validateBody)(crearEsperaSchema), listaEsperaController_1.listaEsperaController.agregar);
router.patch('/:id/estado', auth_1.authenticateStaff, (0, auth_1.requireRoles)('cajero', 'admin'), (0, validate_1.validateBody)(updateEstadoSchema), listaEsperaController_1.listaEsperaController.actualizarEstado);
router.post('/:id/sentar', auth_1.authenticateStaff, (0, auth_1.requireRoles)('cajero', 'admin'), (0, validate_1.validateBody)(sentarSchema), listaEsperaController_1.listaEsperaController.sentarCliente);
exports.default = router;
