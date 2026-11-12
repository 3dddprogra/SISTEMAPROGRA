"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const facturacionController_1 = require("../../controllers/facturacionController");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.get('/resumen', auth_1.authenticateStaff, (0, auth_1.requireRoles)('cajero', 'admin'), facturacionController_1.facturacionController.getResumen);
exports.default = router;
