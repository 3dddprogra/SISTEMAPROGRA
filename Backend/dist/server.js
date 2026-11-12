"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = require("./app");
const env_1 = require("./config/env");
const socketManager_1 = require("./sockets/socketManager");
const database_1 = require("./config/database");
const logger_1 = require("./utils/logger");
const server = http_1.default.createServer(app_1.app);
// Inicializar WebSockets con Socket.io
(0, socketManager_1.initSocketIO)(server);
// Iniciar servidor HTTP
server.listen(env_1.ENV.PORT, async () => {
    logger_1.logger.info(`=======================================================`);
    logger_1.logger.info(`🍽️  FOODTECH BACKEND INICIADO EN PUERTO ${env_1.ENV.PORT}`);
    logger_1.logger.info(`   Ambiente: ${env_1.ENV.NODE_ENV}`);
    logger_1.logger.info(`   API Endpoint: http://localhost:${env_1.ENV.PORT}/api/v1`);
    logger_1.logger.info(`   Healthcheck: http://localhost:${env_1.ENV.PORT}/api/v1/health`);
    logger_1.logger.info(`=======================================================`);
    // Verificar conectividad con MySQL
    try {
        const dbCheck = await (0, database_1.checkDatabaseConnection)();
        if (dbCheck.ok) {
            logger_1.logger.info(`✅ Conexión con base de datos MySQL 8 ('${env_1.ENV.DB_NAME}') establecida (${dbCheck.latencyMs}ms).`);
        }
        else {
            logger_1.logger.warn(`⚠️ MySQL no disponible de inmediato (${dbCheck.error}). El servidor sigue activo esperando conexión.`);
        }
    }
    catch (err) {
        logger_1.logger.warn('⚠️ Error al verificar base de datos:', err);
    }
});
// Manejo de señales de terminación para apagado limpio (PM2 / Systemd)
process.on('SIGTERM', () => {
    logger_1.logger.info('Señal SIGTERM recibida. Cerrando servidor FoodTech...');
    server.close(() => {
        logger_1.logger.info('Servidor HTTP cerrado exitosamente.');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    logger_1.logger.info('Señal SIGINT recibida (Ctrl+C). Apagando servidor...');
    server.close(() => {
        process.exit(0);
    });
});
