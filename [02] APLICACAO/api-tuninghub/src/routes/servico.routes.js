import { Router } from 'express';
import ServicoController from '../controllers/servico.controller.js';
import { verificarToken, checkRole } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/', ServicoController.listar);
router.post('/', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN), ServicoController.criar);

export default router;