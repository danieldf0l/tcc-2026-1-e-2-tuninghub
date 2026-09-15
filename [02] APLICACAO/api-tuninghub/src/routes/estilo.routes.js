import { Router } from 'express';
import EstiloController from '../controllers/estilo.controller.js';
import { verificarToken, checkRole } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/', EstiloController.listar);
router.get('/admin', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN), EstiloController.listarAdmin);
router.post('/', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN), EstiloController.criar);
router.put('/:id', verificarToken, checkRole(ROLES.ADMIN_MASTER), EstiloController.atualizar);
router.delete('/:id', verificarToken, checkRole(ROLES.ADMIN_MASTER), EstiloController.desativar);
router.patch('/:id/reativar', verificarToken, checkRole(ROLES.ADMIN_MASTER), EstiloController.reativar);

export default router;