import { describe, it, expect, vi } from 'vitest';
import { pedidoService } from '../src/services/pedidoService';
import { mesaRepository } from '../src/repositories/mesaRepository';
import { productoRepository } from '../src/repositories/productoRepository';

describe('Transacción y Lógica de Creación de Pedidos', () => {
  it('debe rechazar la creación de pedidos sin productos con error 400', async () => {
    await expect(
      pedidoService.crearPedido({
        mesa_id: 1,
        items: [],
      })
    ).rejects.toMatchObject({
      statusCode: 400,
      code: 'EMPTY_ORDER',
    });
  });

  it('debe rechazar pedidos con cantidades menores o iguales a cero', async () => {
    vi.spyOn(mesaRepository, 'findById').mockResolvedValueOnce({
      id: 1,
      numero: 1,
      capacidad: 4,
      estado: 'disponible',
      ubicacion: 'Salón Principal',
    });

    await expect(
      pedidoService.crearPedido({
        mesa_id: 1,
        items: [{ producto_id: 1, cantidad: 0 }],
      })
    ).rejects.toMatchObject({
      statusCode: 400,
      code: 'INVALID_QUANTITY',
    });
  });

  it('debe rechazar pedidos si la mesa no existe', async () => {
    vi.spyOn(mesaRepository, 'findById').mockResolvedValueOnce(null);

    await expect(
      pedidoService.crearPedido({
        mesa_id: 999,
        items: [{ producto_id: 1, cantidad: 2 }],
      })
    ).rejects.toMatchObject({
      statusCode: 404,
      code: 'MESA_NOT_FOUND',
    });
  });

  it('debe rechazar productos no disponibles con error 400', async () => {
    vi.spyOn(mesaRepository, 'findById').mockResolvedValueOnce({
      id: 2,
      numero: 2,
      capacidad: 2,
      estado: 'disponible',
      ubicacion: 'Terraza',
    });

    vi.spyOn(productoRepository, 'findById').mockResolvedValueOnce({
      id: 5,
      categoria_id: 2,
      nombre: 'Pique Macho Agotado',
      precio: 55.0,
      disponible: false, // ¡Agotado!
      tiempo_estimado_min: 20,
    });

    await expect(
      pedidoService.crearPedido({
        mesa_id: 2,
        items: [{ producto_id: 5, cantidad: 1 }],
      })
    ).rejects.toMatchObject({
      statusCode: 400,
      code: 'PRODUCT_UNAVAILABLE',
    });
  });
});
