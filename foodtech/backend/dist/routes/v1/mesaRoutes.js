"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const mesaController_1 = require("../../controllers/mesaController");
const auth_1 = require("../../middleware/auth");
const validate_1 = require("../../middleware/validate");
const router = (0, express_1.Router)();
const updateEstadoSchema = zod_1.z.object({
    estado: zod_1.z.enum(['disponible', 'ocupada', 'reservada', 'inactiva']),
});
// Clientes y personal pueden ver mesas
router.get('/', mesaController_1.mesaController.getMesas);
router.get('/:id', mesaController_1.mesaController.getMesaById);
// Solo cajero o admin pueden cambiar estado manual de mesa
router.patch('/:id/estado', auth_1.authenticateStaff, (0, auth_1.requireRoles)('cajero', 'admin'), (0, validate_1.validateBody)(updateEstadoSchema), mesaController_1.mesaController.updateEstado);
exports.default = router;
