import bcrypt from 'bcryptjs';
import { usuarioRepository } from '../repositories/usuarioRepository';
import { mesaRepository } from '../repositories/mesaRepository';
import { generateStaffToken, generateMesaToken } from '../middleware/auth';
import { RolUsuario } from '../types';

export const authService = {
  async loginStaff(email: string, passwordPlain: string) {
    const usuario = await usuarioRepository.findByEmail(email);
    if (!usuario) {
      throw { statusCode: 401, code: 'AUTH_FAILED', message: 'Credenciales inválidas: correo no registrado.' };
    }

    if (!usuario.activo) {
      throw { statusCode: 403, code: 'USER_INACTIVE', message: 'La cuenta de usuario se encuentra inactiva.' };
    }

    const matches = await bcrypt.compare(passwordPlain, usuario.password_hash);
    if (!matches) {
      throw { statusCode: 401, code: 'AUTH_FAILED', message: 'Credenciales inválidas: contraseña incorrecta.' };
    }

    const token = generateStaffToken({
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol as RolUsuario,
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

  async obtenerTokenMesa(mesaId: number) {
    const mesa = await mesaRepository.findById(mesaId);
    if (!mesa) {
      throw { statusCode: 404, code: 'MESA_NOT_FOUND', message: `La mesa #${mesaId} no existe.` };
    }

    const token = generateMesaToken(mesa.id, mesa.numero);
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
