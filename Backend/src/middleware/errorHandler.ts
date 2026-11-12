import { Request, Response, NextFunction } from 'express';
import { StateMachineError } from '../utils/stateMachine';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  logger.error(`Error procesando solicitud [${req.method} ${req.originalUrl}]:`, err.message);

  if (err instanceof StateMachineError || err.statusCode === 409) {
    res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT_STATE_MACHINE',
        message: err.message,
        details: err instanceof StateMachineError ? { from: err.from, to: err.to } : undefined,
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
