import { pool } from '../config/database';
import { pedidoRepository } from '../repositories/pedidoRepository';
import { mesaRepository } from '../repositories/mesaRepository';
import { productoRepository } from '../repositories/productoRepository';
import { EstadoPedido, MetodoPago, Pedido } from '../types';
import { validateOrderTransition } from '../utils/stateMachine';
import { socketEmitter } from '../sockets/socketManager';

export interface CrearPedidoDTO {
  mesa_id: number;
  usuario_id?: number | null;
  notas?: string | null;
  items: Array<{
    producto_id: number;
    cantidad: number;
    notas?: string | null;
  }>;
}

export const pedidoService = {
  async crearPedido(dto: CrearPedidoDTO): Promise<Pedido> {
    if (!dto.items || dto.items.length === 0) {
      throw { statusCode: 400, code: 'EMPTY_ORDER', message: 'El pedido debe contener al menos un producto.' };
    }

    // Verificar existencia de la mesa
    const mesa = await mesaRepository.findById(dto.mesa_id);
    if (!mesa) {
      throw { statusCode: 404, code: 'MESA_NOT_FOUND', message: `La mesa con ID ${dto.mesa_id} no existe.` };
    }

    // Validar productos y calcular subtotales con snapshot de precio unitario actual
    const detallesPreparados: Array<{
      producto_id: number;
      cantidad: number;
      precio_unitario: number;
      subtotal: number;
      notas?: string | null;
    }> = [];

    let totalCalculado = 0;

    for (const item of dto.items) {
      if (item.cantidad <= 0) {
        throw { statusCode: 400, code: 'INVALID_QUANTITY', message: 'La cantidad debe ser mayor a cero.' };
      }
      const prod = await productoRepository.findById(item.producto_id);
      if (!prod) {
        throw { statusCode: 404, code: 'PRODUCT_NOT_FOUND', message: `Producto con ID ${item.producto_id} no encontrado.` };
      }
      if (!prod.disponible) {
        throw { statusCode: 400, code: 'PRODUCT_UNAVAILABLE', message: `El producto '${prod.nombre}' no se encuentra disponible actualmente.` };
      }

      const precioUnitario = prod.precio;
      const subtotal = Math.round(precioUnitario * item.cantidad * 100) / 100;
      totalCalculado += subtotal;

      detallesPreparados.push({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: precioUnitario,
        subtotal,
        notas: item.notas || null,
      });
    }

    totalCalculado = Math.round(totalCalculado * 100) / 100;

    // Generar código único de comanda (ej: PED-M3-9481)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const codigo = `PED-M${mesa.numero}-${randomSuffix}`;

    // Ejecutar transacción atómica
    const conn = await pool.getConnection();
    let pedidoId: number;
    try {
      await conn.beginTransaction();

      pedidoId = await pedidoRepository.createInTransaction(
        conn,
        {
          mesa_id: dto.mesa_id,
          usuario_id: dto.usuario_id || null,
          codigo,
          estado: 'pendiente',
          total: totalCalculado,
          notas: dto.notas || null,
        },
        detallesPreparados
      );

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    // Obtener pedido completo con datos agregados
    const pedidoCreado = await pedidoRepository.findById(pedidoId);
    if (!pedidoCreado) {
      throw { statusCode: 500, code: 'ORDER_FETCH_FAILED', message: 'Error al recuperar el pedido creado.' };
    }

    // Emitir eventos en tiempo real
    socketEmitter.emitNuevoPedido(pedidoCreado);
    socketEmitter.emitEstadoMesa(dto.mesa_id, 'ocupada');

    return pedidoCreado;
  },

  async actualizarEstado(id: number, nuevoEstado: EstadoPedido): Promise<Pedido> {
    const pedido = await pedidoRepository.findById(id);
    if (!pedido) {
      throw { statusCode: 404, code: 'ORDER_NOT_FOUND', message: `Pedido con ID ${id} no encontrado.` };
    }

    // Validación estricta con máquina de estados (lanza StateMachineError 409 si es inválido)
    validateOrderTransition(pedido.estado, nuevoEstado);

    await pedidoRepository.updateEstado(id, nuevoEstado);

    // Si el pedido pasa a pagado o cancelado, verificar si la mesa se libera
    if (nuevoEstado === 'pagado') {
      await mesaRepository.updateEstado(pedido.mesa_id, 'disponible');
      socketEmitter.emitEstadoMesa(pedido.mesa_id, 'disponible');
    }

    const pedidoActualizado: Pedido = {
      ...pedido,
      estado: nuevoEstado,
    };

    socketEmitter.emitEstadoPedido(pedidoActualizado);
    return pedidoActualizado;
  },

  async cobrarPedido(id: number, metodoPago: MetodoPago): Promise<Pedido> {
    const pedido = await pedidoRepository.findById(id);
    if (!pedido) {
      throw { statusCode: 404, code: 'ORDER_NOT_FOUND', message: `Pedido con ID ${id} no encontrado.` };
    }

    if (pedido.estado === 'pagado') {
      throw { statusCode: 400, code: 'ORDER_ALREADY_PAID', message: 'Este pedido ya fue cobrado previamente.' };
    }

    // Cobrar pedido y registrar método de pago
    await pedidoRepository.cobrarPedido(id, metodoPago);
    await mesaRepository.updateEstado(pedido.mesa_id, 'disponible');

    const pedidoActualizado: Pedido = {
      ...pedido,
      estado: 'pagado',
      metodo_pago: metodoPago,
    };

    socketEmitter.emitEstadoPedido(pedidoActualizado);
    socketEmitter.emitEstadoMesa(pedido.mesa_id, 'disponible');

    return pedidoActualizado;
  },

  async getPedidos(filtros?: { estado?: EstadoPedido; mesaId?: number }) {
    return pedidoRepository.findAll(filtros);
  },

  async getPedidoById(id: number): Promise<Pedido> {
    const pedido = await pedidoRepository.findById(id);
    if (!pedido) {
      throw { statusCode: 404, code: 'ORDER_NOT_FOUND', message: `Pedido con ID ${id} no encontrado.` };
    }
    return pedido;
  },

  async getPedidoActivoMesa(mesaId: number): Promise<Pedido | null> {
    return pedidoRepository.findActiveByMesaId(mesaId);
  },
};
