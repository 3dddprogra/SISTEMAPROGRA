import { Request, Response, NextFunction } from 'express';
import { categoriaService } from '../services/productoService';

export const categoriaController = {
  async getCategorias(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categorias = await categoriaService.getCategorias();
      res.status(200).json({ success: true, data: categorias });
    } catch (err) {
      next(err);
    }
  },

  async getCategoriaById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const categoria = await categoriaService.getCategoriaById(id);
      res.status(200).json({ success: true, data: categoria });
    } catch (err) {
      next(err);
    }
  },
};
