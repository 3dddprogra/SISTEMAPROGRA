"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoriaController_1 = require("../../controllers/categoriaController");
const router = (0, express_1.Router)();
router.get('/', categoriaController_1.categoriaController.getCategorias);
router.get('/:id', categoriaController_1.categoriaController.getCategoriaById);
exports.default = router;
