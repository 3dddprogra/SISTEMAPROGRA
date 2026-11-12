import { Request, Response, NextFunction } from 'express';
import { reservaService } from '../services/reservaService';
import { listaEsperaService } from '../services/listaEsperaService';
import { facturacionService } from '../services/facturacionService';
import { EstadoReserva, EstadoListaEspera } from '../types';

export const reservaController = {
  async getReservas(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reservas = await reservaService.getReservas();
      res.status(200).json({ success: true, data: reservas });
    } catch (err) {
      next(err);
    }
  },

  async crearReserva(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { mesa_id, cliente_nombre, cliente_telefono, cliente_email, num_personas, fecha_hora, notas } = req.body;
      const reserva = await reservaService.crearReserva({
        mesa_id,
        cliente_nombre,
        cliente_telefono,
        cliente_email,
        num_personas,
        fecha_hora,
        notas,
      });
      res.status(201).json({ success: true, data: reserva });
    } catch (err) {
      next(err);
    }
  },

  async actualizarEstado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const { estado } = req.body as { estado: EstadoReserva };
      const reserva = await reservaService.actualizarEstado(id, estado);
      res.status(200).json({ success: true, data: reserva });
    } catch (err) {
      next(err);
    }
  },
};

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
