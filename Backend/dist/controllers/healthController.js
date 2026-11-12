"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthController = void 0;
const database_1 = require("../config/database");
exports.healthController = {
    async checkHealth(_req, res) {
        const dbStatus = await (0, database_1.checkDatabaseConnection)();
        const isHealthy = dbStatus.ok;
        const statusCode = isHealthy ? 200 : 503;
        res.status(statusCode).json({
            success: isHealthy,
            status: isHealthy ? 'UP' : 'DOWN',
            timestamp: new Date().toISOString(),
            uptimeSeconds: Math.floor(process.uptime()),
            database: {
                connected: dbStatus.ok,
                latencyMs: dbStatus.latencyMs,
                error: dbStatus.error || null,
            },
            system: {
                nodeVersion: process.version,
                memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                environment: process.env.NODE_ENV || 'development',
            },
        });
    },
};
