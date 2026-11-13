import { Request, Response, NextFunction } from 'express';
import { mesaService } from '../services/mesaService';
import { EstadoMesa } from '../types';

export const mesaController = {
  async getMesas(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const mesas = await mesaService.getMesas();
      res.status(200).json({ success: true, data: mesas });
    } catch (err) {
      next(err);
    }
  },

  async getMesaById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const mesa = await mesaService.getMesaById(id);
      res.status(200).json({ success: true, data: mesa });
    } catch (err) {
      next(err);
    }
  },

  async updateEstado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const { estado } = req.body as { estado: EstadoMesa };
      const updated = await mesaService.updateEstado(id, estado);
      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },
};
