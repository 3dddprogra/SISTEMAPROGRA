"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.checkDatabaseConnection = checkDatabaseConnection;
const promise_1 = __importDefault(require("mysql2/promise"));
const env_1 = require("./env");
exports.pool = promise_1.default.createPool({
    host: env_1.ENV.DB_HOST,
    port: env_1.ENV.DB_PORT,
    user: env_1.ENV.DB_USER,
    password: env_1.ENV.DB_PASSWORD,
    database: env_1.ENV.DB_NAME,
    waitForConnections: true,
    connectionLimit: 15,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
});
async function checkDatabaseConnection() {
    const start = Date.now();
    try {
        const connection = await exports.pool.getConnection();
        try {
            await connection.query('SELECT 1 AS ping');
            return { ok: true, latencyMs: Date.now() - start };
        }
        finally {
            connection.release();
        }
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { ok: false, latencyMs: Date.now() - start, error: message };
    }
}
