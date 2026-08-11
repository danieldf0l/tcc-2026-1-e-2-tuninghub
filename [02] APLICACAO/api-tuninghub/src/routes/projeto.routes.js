import { Router } from 'express';
import ProjetoController from '../controllers/projeto.controller.js';
import { verificarToken, checkRole } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN), ProjetoController.listar);
router.get('/meus', verificarToken, checkRole(ROLES.USUARIO), ProjetoController.listarMeus);
router.post('/', verificarToken, checkRole(ROLES.USUARIO, ROLES.ADMIN_MASTER, ROLES.ADMIN), ProjetoController.criar);

export default router;