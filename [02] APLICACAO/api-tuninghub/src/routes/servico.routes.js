import { Router } from 'express';
import ServicoController from '../controllers/servico.controller.js';
import { verificarToken, checkRole } from '../middlewares/auth.middleware.js';
import { registrarAcao } from '../middlewares/registrarAcao.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/', ServicoController.listar);
router.get('/admin', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN), ServicoController.listarAdmin);
router.post('/', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN),
  registrarAcao('CRIOU_SERVICO', 'servico'), ServicoController.criar);
router.put('/:id', verificarToken, checkRole(ROLES.ADMIN_MASTER),
  registrarAcao('EDITOU_SERVICO', 'servico'), ServicoController.atualizar);
router.delete('/:id', verificarToken, checkRole(ROLES.ADMIN_MASTER),
  registrarAcao('DESATIVOU_SERVICO', 'servico'), ServicoController.desativar);
router.patch('/:id/reativar', verificarToken, checkRole(ROLES.ADMIN_MASTER),
  registrarAcao('REATIVOU_SERVICO', 'servico'), ServicoController.reativar);

export default router;