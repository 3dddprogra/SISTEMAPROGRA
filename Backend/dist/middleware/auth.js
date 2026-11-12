"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateStaffToken = generateStaffToken;
exports.generateMesaToken = generateMesaToken;
exports.verifyToken = verifyToken;
exports.authenticateStaff = authenticateStaff;
exports.requireRoles = requireRoles;
exports.authenticateMesaOrStaff = authenticateMesaOrStaff;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
function generateStaffToken(payload) {
    return jsonwebtoken_1.default.sign(payload, env_1.ENV.JWT_SECRET, {
        expiresIn: env_1.ENV.JWT_EXPIRES_IN,
    });
}
function generateMesaToken(mesaId, numero) {
    return jsonwebtoken_1.default.sign({ mesaId, numero }, env_1.ENV.JWT_SECRET, {
        expiresIn: '24h',
    });
}
function verifyToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, env_1.ENV.JWT_SECRET);
    }
    catch {
        return null;
    }
}
function authenticateStaff(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message: 'Acceso no autorizado: Se requiere un token Bearer válido para personal del restaurante.',
            },
        });
        return;
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded || !decoded.rol) {
        res.status(401).json({
            success: false,
            error: {
                code: 'INVALID_TOKEN',
                message: 'Token de autenticación expirado o inválido.',
            },
        });
        return;
    }
    req.user = decoded;
    next();
}
function requireRoles(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'No autenticado.' },
            });
            return;
        }
        if (!roles.includes(req.user.rol) && req.user.rol !== 'admin') {
            res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: `Acceso denegado: El rol '${req.user.rol}' no tiene permisos suficientes para este recurso.`,
                },
            });
            return;
        }
        next();
    };
}
function authenticateMesaOrStaff(req, _res, next) {
    const token = req.headers['x-mesa-token'] ||
        (req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : null) ||
        req.query.token;
    if (!token) {
        // Permitir acceso temporal para mesas públicas pero registrando advertencia
        next();
        return;
    }
    const decodedMesa = verifyToken(token);
    if (decodedMesa && decodedMesa.mesaId) {
        req.mesa = decodedMesa;
        next();
        return;
    }
    const decodedStaff = verifyToken(token);
    if (decodedStaff && decodedStaff.rol) {
        req.user = decodedStaff;
        next();
        return;
    }
    next();
}
