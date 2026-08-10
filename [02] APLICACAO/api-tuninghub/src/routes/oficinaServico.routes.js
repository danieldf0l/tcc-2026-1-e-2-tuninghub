import { Router } from 'express';
import OficinaServicoController from '../controllers/oficinaServico.controller.js';
import { verificarToken, checkRole } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/:idOficina', OficinaServicoController.listar);
router.post('/', verificarToken, checkRole(ROLES.OFICINA, ROLES.ADMIN_MASTER, ROLES.ADMIN), OficinaServicoController.vincular);
router.delete('/:idOficina/:idServico', verificarToken, checkRole(ROLES.OFICINA, ROLES.ADMIN_MASTER, ROLES.ADMIN), OficinaServicoController.desvincular);

export default router;