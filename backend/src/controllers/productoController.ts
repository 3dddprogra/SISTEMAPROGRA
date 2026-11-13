import { Request, Response, NextFunction } from 'express';
import { categoriaService, productoService } from '../services/productoService';

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

export const productoController = {
  async getProductos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoriaId = req.query.categoriaId ? parseInt(req.query.categoriaId as string, 10) : undefined;
      const productos = await productoService.getProductos(categoriaId);
      res.status(200).json({ success: true, data: productos });
    } catch (err) {
      next(err);
    }
  },

  async getDisponibles(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const productos = await productoService.getProductosDisponibles();
      res.status(200).json({ success: true, data: productos });
    } catch (err) {
      next(err);
    }
  },

  async getProductoById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const producto = await productoService.getProductoById(id);
      res.status(200).json({ success: true, data: producto });
    } catch (err) {
      next(err);
    }
  },

  async updateDisponibilidad(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const { disponible } = req.body as { disponible: boolean };
      const updated = await productoService.updateDisponibilidad(id, disponible);
      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },
};
