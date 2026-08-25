import { Router } from 'express';
import ModeloController from '../controllers/modelo.controller.js';
import { verificarToken, checkRole } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/', ModeloController.listar);
router.get('/admin', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN), ModeloController.listarAdmin);
router.get('/montadora/:idMontadora', ModeloController.listarPorMontadora);
router.post('/', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN), ModeloController.criar);
router.put('/:id', verificarToken, checkRole(ROLES.ADMIN_MASTER), ModeloController.atualizar);
router.delete('/:id', verificarToken, checkRole(ROLES.ADMIN_MASTER), ModeloController.desativar);
router.patch('/:id/reativar', verificarToken, checkRole(ROLES.ADMIN_MASTER), ModeloController.reativar);

export default router;