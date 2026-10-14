import { Router } from 'express';
import EstiloController from '../controllers/estilo.controller.js';
import { verificarToken, checkRole } from '../middlewares/auth.middleware.js';
import { registrarAcao } from '../middlewares/registrarAcao.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/', EstiloController.listar);
router.get('/admin', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN), EstiloController.listarAdmin);
router.post('/', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN),
  registrarAcao('CRIOU_ESTILO', 'estilo'), EstiloController.criar);
router.put('/:id', verificarToken, checkRole(ROLES.ADMIN_MASTER),
  registrarAcao('EDITOU_ESTILO', 'estilo'), EstiloController.atualizar);
router.delete('/:id', verificarToken, checkRole(ROLES.ADMIN_MASTER),
  registrarAcao('DESATIVOU_ESTILO', 'estilo'), EstiloController.desativar);
router.patch('/:id/reativar', verificarToken, checkRole(ROLES.ADMIN_MASTER),
  registrarAcao('REATIVOU_ESTILO', 'estilo'), EstiloController.reativar);

export default router;