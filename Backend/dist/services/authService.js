"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const usuarioRepository_1 = require("../repositories/usuarioRepository");
const mesaRepository_1 = require("../repositories/mesaRepository");
const auth_1 = require("../middleware/auth");
exports.authService = {
    async loginStaff(email, passwordPlain) {
        const usuario = await usuarioRepository_1.usuarioRepository.findByEmail(email);
        if (!usuario) {
            throw { statusCode: 401, code: 'AUTH_FAILED', message: 'Credenciales inválidas: correo no registrado.' };
        }
        if (!usuario.activo) {
            throw { statusCode: 403, code: 'USER_INACTIVE', message: 'La cuenta de usuario se encuentra inactiva.' };
        }
        const matches = await bcryptjs_1.default.compare(passwordPlain, usuario.password_hash);
        if (!matches) {
            throw { statusCode: 401, code: 'AUTH_FAILED', message: 'Credenciales inválidas: contraseña incorrecta.' };
        }
        const token = (0, auth_1.generateStaffToken)({
            id: usuario.id,
            email: usuario.email,
            nombre: usuario.nombre,
            rol: usuario.rol,
        });
        return {
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol,
            },
        };
    },
    async obtenerTokenMesa(mesaId) {
        const mesa = await mesaRepository_1.mesaRepository.findById(mesaId);
        if (!mesa) {
            throw { statusCode: 404, code: 'MESA_NOT_FOUND', message: `La mesa #${mesaId} no existe.` };
        }
        const token = (0, auth_1.generateMesaToken)(mesa.id, mesa.numero);
        return {
            token,
            mesa: {
                id: mesa.id,
                numero: mesa.numero,
                capacidad: mesa.capacidad,
                estado: mesa.estado,
                ubicacion: mesa.ubicacion,
            },
        };
    },
};
