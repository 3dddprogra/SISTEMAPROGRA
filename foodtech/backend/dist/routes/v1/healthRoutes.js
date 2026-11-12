"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const healthController_1 = require("../../controllers/healthController");
const router = (0, express_1.Router)();
// GET /api/v1/health - Comprueba la conexión a MySQL y el estado del backend
router.get('/', healthController_1.healthController.checkHealth);
exports.default = router;
