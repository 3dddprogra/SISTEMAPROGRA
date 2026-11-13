import { Request, Response, NextFunction } from 'express';
import { facturacionService } from '../services/facturacionService';

export const facturacionController = {
  async getResumen(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resumen = await facturacionService.getResumen();
      res.status(200).json({ success: true, data: resumen });
    } catch (err) {
      next(err);
    }
  },
};
