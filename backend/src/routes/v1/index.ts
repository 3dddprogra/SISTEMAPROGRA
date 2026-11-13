import { Router } from 'express';
import authRoutes from './authRoutes';
import mesaRoutes from './mesaRoutes';
import categoriaRoutes from './categoriaRoutes';
import productoRoutes from './productoRoutes';
import pedidoRoutes from './pedidoRoutes';
import reservaRoutes from './reservaRoutes';
import listaEsperaRoutes from './listaEsperaRoutes';
import facturacionRoutes from './facturacionRoutes';
import healthRoutes from './healthRoutes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/mesas', mesaRoutes);
router.use('/categorias', categoriaRoutes);
router.use('/productos', productoRoutes);
router.use('/pedidos', pedidoRoutes);
router.use('/reservas', reservaRoutes);
router.use('/lista-espera', listaEsperaRoutes);
router.use('/facturacion', facturacionRoutes);

export default router;
