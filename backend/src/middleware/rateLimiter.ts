import rateLimit from 'express-rate-limit';

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // Límite de 1000 peticiones por ventana para soportar KDS/tiempo real
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Demasiadas solicitudes desde esta IP, por favor intente nuevamente en 15 minutos.',
    },
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 intentos de login en 15 minutos
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT',
      message: 'Demasiados intentos de autenticación. Espere unos minutos.',
    },
  },
});
