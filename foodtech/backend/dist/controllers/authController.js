"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const authService_1 = require("../services/authService");
exports.authController = {
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await authService_1.authService.loginStaff(email, password);
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (err) {
            next(err);
        }
    },
    async me(req, res) {
        res.status(200).json({
            success: true,
            data: req.user,
        });
    },
    async getMesaToken(req, res, next) {
        try {
            const mesaId = parseInt(req.params.mesaId, 10);
            const result = await authService_1.authService.obtenerTokenMesa(mesaId);
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (err) {
            next(err);
        }
    },
};
