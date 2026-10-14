import { Router } from 'express';
import PlanoController from '../controllers/plano.controller.js';
import { verificarToken, checkRole } from '../middlewares/auth.middleware.js';
import { registrarAcao } from '../middlewares/registrarAcao.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/', PlanoController.listar);
router.post('/', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN),
  registrarAcao('CRIOU_PLANO', 'plano'), PlanoController.criar);
router.patch('/:id/produto-externo', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN),
  registrarAcao('VINCULOU_PRODUTO_EXTERNO_PLANO', 'plano'), PlanoController.vincularProdutoExterno);
router.put('/:id', verificarToken, checkRole(ROLES.ADMIN_MASTER),
  registrarAcao('EDITOU_PLANO', 'plano'), PlanoController.atualizar);
router.delete('/:id', verificarToken, checkRole(ROLES.ADMIN_MASTER),
  registrarAcao('DESATIVOU_PLANO', 'plano'), PlanoController.desativar);
router.patch('/:id/reativar', verificarToken, checkRole(ROLES.ADMIN_MASTER),
  registrarAcao('REATIVOU_PLANO', 'plano'), PlanoController.reativar);
router.get('/admin', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN), PlanoController.listarAdmin);

export default router;