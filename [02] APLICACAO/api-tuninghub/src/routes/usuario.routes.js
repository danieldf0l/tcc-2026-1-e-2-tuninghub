import { Router } from 'express';
import UsuarioController from '../controllers/usuario.controller.js';
import { verificarToken, checkRole } from '../middlewares/auth.middleware.js';
import { contaLimiter } from '../middlewares/contaLimiter.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/', verificarToken, checkRole(ROLES.ADMIN, ROLES.ADMIN_MASTER), UsuarioController.listar);
router.post('/', UsuarioController.criar);

router.get('/me', verificarToken, checkRole(ROLES.USUARIO), UsuarioController.meusDados);
router.put('/me', verificarToken, checkRole(ROLES.USUARIO), contaLimiter, UsuarioController.atualizarMeusDados);
router.patch('/me/senha', verificarToken, checkRole(ROLES.USUARIO), contaLimiter, UsuarioController.alterarSenha);
// Exclusão física da própria conta (LGPD). DEVE ficar antes de DELETE /:id, senão "me" vira :id.
router.delete('/me', verificarToken, checkRole(ROLES.USUARIO), contaLimiter, UsuarioController.excluirMinhaConta);

router.patch('/aceitar-termos', verificarToken, checkRole(ROLES.USUARIO), UsuarioController.aceitarTermos);
router.get('/admin', verificarToken, checkRole(ROLES.ADMIN, ROLES.ADMIN_MASTER), UsuarioController.listarAdmin);
router.delete('/:id', verificarToken, checkRole(ROLES.ADMIN_MASTER), UsuarioController.desativar);
router.patch('/:id/reativar', verificarToken, checkRole(ROLES.ADMIN_MASTER), UsuarioController.reativar);

export default router;