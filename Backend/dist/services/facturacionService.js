"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.facturacionService = void 0;
const facturacionRepository_1 = require("../repositories/facturacionRepository");
exports.facturacionService = {
    async getResumen() {
        return facturacionRepository_1.facturacionRepository.getResumen();
    },
};
