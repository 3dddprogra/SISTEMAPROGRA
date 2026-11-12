import { Request, Response, NextFunction } from 'express';
import { pedidoService } from '../services/pedidoService';
import { EstadoPedido, MetodoPago } from '../types';
import { AuthenticatedRequest } from '../middleware/auth';

export const pedidoController = {
  async crearPedido(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { mesa_id, notas, items } = req.body;
      const usuario_id = req.user ? req.user.id : null;

      const pedido = await pedidoService.crearPedido({
        mesa_id,
        usuario_id,
        notas,
        items,
      });

      res.status(201).json({
        success: true,
        data: pedido,
      });
    } catch (err) {
      next(err);
    }
  },

  async getPedidos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const estado = req.query.estado as EstadoPedido | undefined;
      const mesaId = req.query.mesaId ? parseInt(req.query.mesaId as string, 10) : undefined;

      const pedidos = await pedidoService.getPedidos({ estado, mesaId });
      res.status(200).json({
        success: true,
        data: pedidos,
      });
    } catch (err) {
      next(err);
    }
  },

  async getPedidoById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const pedido = await pedidoService.getPedidoById(id);
      res.status(200).json({
        success: true,
        data: pedido,
      });
    } catch (err) {
      next(err);
    }
  },

  async getActivoMesa(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const mesaId = parseInt(req.params.mesaId, 10);
      const pedido = await pedidoService.getPedidoActivoMesa(mesaId);
      res.status(200).json({
        success: true,
        data: pedido,
      });
    } catch (err) {
      next(err);
    }
  },

  async actualizarEstado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const { estado } = req.body as { estado: EstadoPedido };

      const pedidoActualizado = await pedidoService.actualizarEstado(id, estado);
      res.status(200).json({
        success: true,
        data: pedidoActualizado,
      });
    } catch (err) {
      next(err);
    }
  },

  async cobrarPedido(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const { metodo_pago } = req.body as { metodo_pago: MetodoPago };

      const pedidoCobrado = await pedidoService.cobrarPedido(id, metodo_pago);
      res.status(200).json({
        success: true,
        data: pedidoCobrado,
      });
    } catch (err) {
      next(err);
    }
  },
};
