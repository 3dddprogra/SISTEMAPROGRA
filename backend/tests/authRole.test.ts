import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { generateStaffToken, generateMesaToken, verifyToken } from '../src/middleware/auth';
import { JwtPayload } from '../src/types';
import { puedeUnirseASala } from '../src/sockets/socketManager';

describe('Autenticación y Autorización por Rol (RBAC)', () => {
  const adminPayload: JwtPayload = {
    id: 1,
    nombre: 'Admin General',
    email: 'admin@foodtech.bo',
    rol: 'admin',
  };

  const cajeroPayload: JwtPayload = {
    id: 2,
    nombre: 'Cajera Salón',
    email: 'cajero@foodtech.bo',
    rol: 'cajero',
  };

  const cocinaPayload: JwtPayload = {
    id: 3,
    nombre: 'Chef KDS',
    email: 'cocina@foodtech.bo',
    rol: 'cocina',
  };

  it('debe firmar y verificar tokens JWT correctamente', () => {
    const token = generateStaffToken(adminPayload);
    expect(typeof token).toBe('string');

    const decoded = verifyToken<JwtPayload>(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.email).toBe('admin@foodtech.bo');
    expect(decoded?.rol).toBe('admin');
  });

  it('debe firmar tokens de mesa para clientes QR sin requerir cuenta de usuario', () => {
    const mesaToken = generateMesaToken(5, 5);
    const decoded = verifyToken<{ mesaId: number; numero: number }>(mesaToken);
    expect(decoded).not.toBeNull();
    expect(decoded?.mesaId).toBe(5);
    expect(decoded?.numero).toBe(5);
  });

  it('debe rechazar peticiones protegidas sin header de autorización con 401', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('debe permitir acceso al endpoint /me con token válido', async () => {
    const token = generateStaffToken(cajeroPayload);
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('cajero@foodtech.bo');
    expect(res.body.data.rol).toBe('cajero');
  });

  it('debe denegar acceso con 403 a cocina en endpoints reservados para caja/admin', async () => {
    const tokenCocina = generateStaffToken(cocinaPayload);
    // /api/v1/facturacion/resumen requiere rol cajero o admin
    const res = await request(app)
      .get('/api/v1/facturacion/resumen')
      .set('Authorization', `Bearer ${tokenCocina}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});

describe('Acceso del cliente QR: no puede ver caja ni cocina', () => {
  const token = (rol: 'admin' | 'cajero' | 'cocina') =>
    generateStaffToken({ id: 9, nombre: 'Prueba', email: `${rol}@foodtech.bo`, rol });

  it('sin iniciar sesión, la API de caja y cocina responde 401', async () => {
    for (const ruta of ['/api/v1/pedidos', '/api/v1/pedidos/1', '/api/v1/reservas', '/api/v1/lista-espera']) {
      const res = await request(app).get(ruta);
      expect(res.status, ruta).toBe(401);
    }
    const crear = await request(app).post('/api/v1/reservas').send({});
    expect(crear.status).toBe(401);
  });

  it('un token de mesa (cliente QR) tampoco sirve para ver pedidos ni reservas', async () => {
    const mesaToken = generateMesaToken(3, 3);
    const res = await request(app).get('/api/v1/pedidos').set('Authorization', `Bearer ${mesaToken}`);
    expect(res.status).toBe(401);
  });

  it('cocina no puede ver reservas ni lista de espera (son de caja)', async () => {
    const res = await request(app).get('/api/v1/reservas').set('Authorization', `Bearer ${token('cocina')}`);
    expect(res.status).toBe(403);
  });
});

describe('Salas de tiempo real (Socket.IO)', () => {
  const tokenDe = (rol: 'admin' | 'cajero' | 'cocina') =>
    generateStaffToken({ id: 9, nombre: 'Prueba', email: `${rol}@foodtech.bo`, rol });

  it('sin token nadie entra a la sala de cocina ni a la de caja', () => {
    expect(puedeUnirseASala('cocina', undefined)).toBe(false);
    expect(puedeUnirseASala('caja', 'token-falso')).toBe(false);
  });

  it('cada rol entra solo a su sala; el admin entra a todas', () => {
    expect(puedeUnirseASala('cocina', tokenDe('cocina'))).toBe(true);
    expect(puedeUnirseASala('caja', tokenDe('cocina'))).toBe(false);
    expect(puedeUnirseASala('caja', tokenDe('cajero'))).toBe(true);
    expect(puedeUnirseASala('cocina', tokenDe('cajero'))).toBe(false);
    expect(puedeUnirseASala('cocina', tokenDe('admin'))).toBe(true);
    expect(puedeUnirseASala('caja', tokenDe('admin'))).toBe(true);
  });
});
