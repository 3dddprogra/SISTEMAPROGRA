"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const v1_1 = __importDefault(require("./routes/v1"));
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
const env_1 = require("./config/env");
exports.app = (0, express_1.default)();
// Seguridad con Helmet
exports.app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}));
// CORS configurado para admitir frontend y peticiones de red
exports.app.use((0, cors_1.default)({
    origin: env_1.ENV.CORS_ORIGIN === '*' ? true : env_1.ENV.CORS_ORIGIN.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-mesa-token'],
}));
// Rate limit general para la API
exports.app.use('/api', rateLimiter_1.apiRateLimiter);
// Parseo de JSON y urlencoded
exports.app.use(express_1.default.json({ limit: '10mb' }));
exports.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Rutas versionadas v1
exports.app.use('/api/v1', v1_1.default);
// Alias /api para compatibilidad transparente con frontend sin versión explícita
exports.app.use('/api', v1_1.default);
// Ruta 404 para endpoints no encontrados
exports.app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'ROUTE_NOT_FOUND',
            message: `El recurso solicitado [${req.method} ${req.originalUrl}] no existe en este servidor.`,
        },
    });
});
// Middleware de manejo de errores centralizado
exports.app.use(errorHandler_1.errorHandler);
