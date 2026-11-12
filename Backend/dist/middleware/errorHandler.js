"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const stateMachine_1 = require("../utils/stateMachine");
const logger_1 = require("../utils/logger");
function errorHandler(err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_next) {
    logger_1.logger.error(`Error procesando solicitud [${req.method} ${req.originalUrl}]:`, err.message);
    if (err instanceof stateMachine_1.StateMachineError || err.statusCode === 409) {
        res.status(409).json({
            success: false,
            error: {
                code: 'CONFLICT_STATE_MACHINE',
                message: err.message,
                details: err instanceof stateMachine_1.StateMachineError ? { from: err.from, to: err.to } : undefined,
            },
        });
        return;
    }
    const statusCode = err.statusCode || 500;
    const message = statusCode === 500 && process.env.NODE_ENV === 'production'
        ? 'Ocurrió un error interno en el servidor.'
        : err.message;
    res.status(statusCode).json({
        success: false,
        error: {
            code: err.code || (statusCode === 404 ? 'NOT_FOUND' : statusCode === 400 ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR'),
            message,
            details: err.details,
        },
    });
}
