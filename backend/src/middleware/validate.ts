import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err: unknown) {
      if (err instanceof ZodError) {
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

export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.params = schema.parse(req.params) as Record<string, string>;
      next();
    } catch (err: unknown) {
      if (err instanceof ZodError) {
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

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query) as Record<string, string>;
      next();
    } catch (err: unknown) {
      if (err instanceof ZodError) {
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
