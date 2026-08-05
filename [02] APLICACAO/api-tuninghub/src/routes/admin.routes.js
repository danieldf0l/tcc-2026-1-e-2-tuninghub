import { Router } from 'express';
import AdminController from '../controllers/admin.controller.js';
import { verificarToken, checkRole } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN), AdminController.listar);
router.post('/', verificarToken, checkRole(ROLES.ADMIN_MASTER), AdminController.criar);

export default router;