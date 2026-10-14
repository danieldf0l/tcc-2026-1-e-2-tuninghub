import { Router } from 'express';
import MontadoraController from '../controllers/montadora.controller.js';
import { verificarToken, checkRole } from '../middlewares/auth.middleware.js';
import { registrarAcao } from '../middlewares/registrarAcao.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/', MontadoraController.listar);
router.get('/admin', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN), MontadoraController.listarAdmin);
router.post('/', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN),
  registrarAcao('CRIOU_MONTADORA', 'montadora'), MontadoraController.criar);
router.put('/:id', verificarToken, checkRole(ROLES.ADMIN_MASTER),
  registrarAcao('EDITOU_MONTADORA', 'montadora'), MontadoraController.atualizar);
router.delete('/:id', verificarToken, checkRole(ROLES.ADMIN_MASTER),
  registrarAcao('DESATIVOU_MONTADORA', 'montadora'), MontadoraController.desativar);
router.patch('/:id/reativar', verificarToken, checkRole(ROLES.ADMIN_MASTER),
  registrarAcao('REATIVOU_MONTADORA', 'montadora'), MontadoraController.reativar);

export default router;