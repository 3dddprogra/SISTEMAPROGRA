import { categoriaRepository } from '../repositories/categoriaRepository';
import { productoRepository } from '../repositories/productoRepository';

export const categoriaService = {
  async getCategorias() {
    return categoriaRepository.findAll();
  },

  async getCategoriaById(id: number) {
    const categoria = await categoriaRepository.findById(id);
    if (!categoria) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: `Categoría con ID ${id} no encontrada.` };
    }
    return categoria;
  },
};

export const productoService = {
  async getProductos(categoriaId?: number) {
    return productoRepository.findAll(categoriaId);
  },

  async getProductosDisponibles() {
    return productoRepository.findDisponibles();
  },

  async getProductoById(id: number) {
    const producto = await productoRepository.findById(id);
    if (!producto) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: `Producto con ID ${id} no encontrado.` };
    }
    return producto;
  },

  async updateDisponibilidad(id: number, disponible: boolean) {
    const producto = await productoRepository.findById(id);
    if (!producto) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: `Producto con ID ${id} no encontrado.` };
    }
    await productoRepository.updateDisponibilidad(id, disponible);
    return { ...producto, disponible };
  },
};
