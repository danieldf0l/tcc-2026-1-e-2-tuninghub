import { Router } from 'express';
import ServicoController from '../controllers/servico.controller.js';
import { verificarToken, checkRole } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/', ServicoController.listar);
router.get('/admin', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN), ServicoController.listarAdmin);
router.post('/', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN), ServicoController.criar);
router.put('/:id', verificarToken, checkRole(ROLES.ADMIN_MASTER), ServicoController.atualizar);
router.delete('/:id', verificarToken, checkRole(ROLES.ADMIN_MASTER), ServicoController.desativar);
router.patch('/:id/reativar', verificarToken, checkRole(ROLES.ADMIN_MASTER), ServicoController.reativar);

export default router;