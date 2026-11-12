"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
exports.validateParams = validateParams;
exports.validateQuery = validateQuery;
const zod_1 = require("zod");
function validateBody(schema) {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Los datos enviados no cumplen con el formato requerido.',
                        details: err.errors.map(e => ({
                            campo: e.path.join('.'),
                            mensaje: e.message,
                        })),
                    },
                });
                return;
            }
            next(err);
        }
    };
}
function validateParams(schema) {
    return (req, res, next) => {
        try {
            req.params = schema.parse(req.params);
            next();
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'PARAM_VALIDATION_ERROR',
                        message: 'Parámetros de ruta inválidos.',
                        details: err.errors,
                    },
                });
                return;
            }
            next(err);
        }
    };
}
function validateQuery(schema) {
    return (req, res, next) => {
        try {
            req.query = schema.parse(req.query);
            next();
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'QUERY_VALIDATION_ERROR',
                        message: 'Parámetros de búsqueda inválidos.',
                        details: err.errors,
                    },
                });
                return;
            }
            next(err);
        }
    };
}
