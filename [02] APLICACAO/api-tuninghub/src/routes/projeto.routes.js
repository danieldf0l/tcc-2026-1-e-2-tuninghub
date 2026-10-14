import { Router } from 'express';
import ProjetoController from '../controllers/projeto.controller.js';
import { verificarToken, checkRole } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN), ProjetoController.listar);
router.get('/meus', verificarToken, checkRole(ROLES.USUARIO), ProjetoController.listarMeus);
router.get('/meus/inativos', verificarToken, checkRole(ROLES.USUARIO), ProjetoController.listarMeusInativos);
router.post('/', verificarToken, checkRole(ROLES.USUARIO, ROLES.ADMIN_MASTER, ROLES.ADMIN), ProjetoController.criar);

// dono ou admin (a checagem de dono fica no service)
router.put('/:id', verificarToken, checkRole(ROLES.USUARIO, ROLES.ADMIN_MASTER, ROLES.ADMIN), ProjetoController.atualizar);
router.delete('/:id', verificarToken, checkRole(ROLES.USUARIO, ROLES.ADMIN_MASTER, ROLES.ADMIN), ProjetoController.desativar);
router.patch('/:id/reativar', verificarToken, checkRole(ROLES.USUARIO, ROLES.ADMIN_MASTER, ROLES.ADMIN), ProjetoController.reativar);

export default router;