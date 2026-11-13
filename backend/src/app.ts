import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import v1Routes from './routes/v1';
import { errorHandler } from './middleware/errorHandler';
import { apiRateLimiter } from './middleware/rateLimiter';
import { ENV } from './config/env';

export const app: Application = express();

// Seguridad con Helmet
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configurado para admitir frontend y peticiones de red
app.use(
  cors({
    origin: ENV.CORS_ORIGIN === '*' ? true : ENV.CORS_ORIGIN.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-mesa-token'],
  })
);

// Rate limit general para la API
app.use('/api', apiRateLimiter);

// Parseo de JSON y urlencoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rutas versionadas v1
app.use('/api/v1', v1Routes);

// Alias /api para compatibilidad transparente con frontend sin versión explícita
app.use('/api', v1Routes);

// Ruta 404 para endpoints no encontrados
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `El recurso solicitado [${req.method} ${req.originalUrl}] no existe en este servidor.`,
    },
  });
});

// Middleware de manejo de errores centralizado
app.use(errorHandler);
