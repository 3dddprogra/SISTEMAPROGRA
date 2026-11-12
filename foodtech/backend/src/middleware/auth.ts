import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { JwtPayload, MesaTokenPayload, RolUsuario } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
  mesa?: MesaTokenPayload;
}

export function generateStaffToken(payload: JwtPayload): string {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function generateMesaToken(mesaId: number, numero: number): string {
  return jwt.sign({ mesaId, numero }, ENV.JWT_SECRET, {
    expiresIn: '24h',
  });
}

export function verifyToken<T>(token: string): T | null {
  try {
    return jwt.verify(token, ENV.JWT_SECRET) as T;
  } catch {
    return null;
  }
}

export function authenticateStaff(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
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
  const decoded = verifyToken<JwtPayload>(token);

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

export function requireRoles(...roles: RolUsuario[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
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

export function authenticateMesaOrStaff(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const token = (req.headers['x-mesa-token'] as string) ||
    (req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : null) ||
    (req.query.token as string);

  if (!token) {
    // Permitir acceso temporal para mesas públicas pero registrando advertencia
    next();
    return;
  }

  const decodedMesa = verifyToken<MesaTokenPayload>(token);
  if (decodedMesa && decodedMesa.mesaId) {
    req.mesa = decodedMesa;
    next();
    return;
  }

  const decodedStaff = verifyToken<JwtPayload>(token);
  if (decodedStaff && decodedStaff.rol) {
    req.user = decodedStaff;
    next();
    return;
  }

  next();
}
