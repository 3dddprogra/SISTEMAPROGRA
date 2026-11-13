import { Request, Response, NextFunction } from 'express';
import { listaEsperaService } from '../services/listaEsperaService';
import { EstadoListaEspera } from '../types';

export const listaEsperaController = {
  async getLista(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lista = await listaEsperaService.getLista();
      res.status(200).json({ success: true, data: lista });
    } catch (err) {
      next(err);
    }
  },

  async agregar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cliente_nombre, telefono, num_personas, tiempo_estimado_espera, notas } = req.body;
      const item = await listaEsperaService.agregarCliente({
        cliente_nombre,
        telefono,
        num_personas,
        tiempo_estimado_espera,
        notas,
      });
      res.status(201).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  },

  async actualizarEstado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const { estado, mesa_id } = req.body as { estado: EstadoListaEspera; mesa_id?: number };
      const item = await listaEsperaService.actualizarEstado(id, estado, mesa_id);
      res.status(200).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  },

  async sentarCliente(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const { mesa_id } = req.body as { mesa_id: number };
      const item = await listaEsperaService.sentarCliente(id, mesa_id);
      res.status(200).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  },
};
