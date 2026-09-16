import { Router } from 'express';
import UsuarioController from '../controllers/usuario.controller.js';
import { verificarToken, checkRole } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/', verificarToken, checkRole(ROLES.ADMIN, ROLES.ADMIN_MASTER), UsuarioController.listar);
router.post('/', UsuarioController.criar);
router.patch('/aceitar-termos', verificarToken, checkRole(ROLES.USUARIO), UsuarioController.aceitarTermos);
router.get('/admin', verificarToken, checkRole(ROLES.ADMIN, ROLES.ADMIN_MASTER), UsuarioController.listarAdmin);
router.delete('/:id', verificarToken, checkRole(ROLES.ADMIN_MASTER), UsuarioController.desativar);
router.patch('/:id/reativar', verificarToken, checkRole(ROLES.ADMIN_MASTER), UsuarioController.reativar);

export default router;