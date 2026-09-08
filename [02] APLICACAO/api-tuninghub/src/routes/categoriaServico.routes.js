import { Router } from 'express';
import CategoriaServicoController from '../controllers/categoriaServico.controller.js';
import { verificarToken, checkRole } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/', CategoriaServicoController.listar);
router.get('/admin', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN), CategoriaServicoController.listarAdmin);
router.post('/', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN), CategoriaServicoController.criar);
router.put('/:id', verificarToken, checkRole(ROLES.ADMIN_MASTER), CategoriaServicoController.atualizar);
router.delete('/:id', verificarToken, checkRole(ROLES.ADMIN_MASTER), CategoriaServicoController.desativar);
router.patch('/:id/reativar', verificarToken, checkRole(ROLES.ADMIN_MASTER), CategoriaServicoController.reativar);

export default router;