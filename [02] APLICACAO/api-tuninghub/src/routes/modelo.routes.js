import { Router } from 'express';
import ModeloController from '../controllers/modelo.controller.js';
import { verificarToken, checkRole } from '../middlewares/auth.middleware.js';
import { registrarAcao } from '../middlewares/registrarAcao.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/', ModeloController.listar);
router.get('/admin', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN), ModeloController.listarAdmin);
router.get('/montadora/:idMontadora', ModeloController.listarPorMontadora);
router.post('/', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN),
  registrarAcao('CRIOU_MODELO', 'modelo'), ModeloController.criar);
router.put('/:id', verificarToken, checkRole(ROLES.ADMIN_MASTER),
  registrarAcao('EDITOU_MODELO', 'modelo'), ModeloController.atualizar);
router.delete('/:id', verificarToken, checkRole(ROLES.ADMIN_MASTER),
  registrarAcao('DESATIVOU_MODELO', 'modelo'), ModeloController.desativar);
router.patch('/:id/reativar', verificarToken, checkRole(ROLES.ADMIN_MASTER),
  registrarAcao('REATIVOU_MODELO', 'modelo'), ModeloController.reativar);

export default router;