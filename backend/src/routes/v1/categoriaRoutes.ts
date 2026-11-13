import { Router } from 'express';
import { categoriaController } from '../../controllers/categoriaController';

const router = Router();

router.get('/', categoriaController.getCategorias);
router.get('/:id', categoriaController.getCategoriaById);

export default router;
