import { Router } from 'express';
import PlanoController from '../controllers/plano.controller.js';
import { verificarToken, checkRole } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/', PlanoController.listar);
router.post('/', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN), PlanoController.criar);
router.patch('/:id/produto-externo', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN), PlanoController.vincularProdutoExterno);
router.put('/:id', verificarToken, checkRole(ROLES.ADMIN_MASTER), PlanoController.atualizar);
router.delete('/:id', verificarToken, checkRole(ROLES.ADMIN_MASTER), PlanoController.desativar);
router.patch('/:id/reativar', verificarToken, checkRole(ROLES.ADMIN_MASTER), PlanoController.reativar);

export default router;