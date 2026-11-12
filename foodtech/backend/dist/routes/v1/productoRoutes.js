"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const productoController_1 = require("../../controllers/productoController");
const auth_1 = require("../../middleware/auth");
const validate_1 = require("../../middleware/validate");
const router = (0, express_1.Router)();
const updateDisponibilidadSchema = zod_1.z.object({
    disponible: zod_1.z.boolean(),
});
router.get('/', productoController_1.productoController.getProductos);
router.get('/disponibles', productoController_1.productoController.getDisponibles);
router.get('/:id', productoController_1.productoController.getProductoById);
// Cocina o Admin pueden pausar/activar productos si se agotan
router.patch('/:id/disponibilidad', auth_1.authenticateStaff, (0, auth_1.requireRoles)('cocina', 'admin', 'cajero'), (0, validate_1.validateBody)(updateDisponibilidadSchema), productoController_1.productoController.updateDisponibilidad);
exports.default = router;
