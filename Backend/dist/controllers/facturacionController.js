"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.facturacionController = void 0;
const facturacionService_1 = require("../services/facturacionService");
exports.facturacionController = {
    async getResumen(_req, res, next) {
        try {
            const resumen = await facturacionService_1.facturacionService.getResumen();
            res.status(200).json({ success: true, data: resumen });
        }
        catch (err) {
            next(err);
        }
    },
};
