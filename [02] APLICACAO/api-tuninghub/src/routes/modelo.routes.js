import { Router } from 'express';
import ModeloController from '../controllers/modelo.controller.js';
import { verificarToken, checkRole } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/', ModeloController.listar);
router.get('/montadora/:idMontadora', ModeloController.listarPorMontadora);

router.post('/', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN), ModeloController.criar);

export default router;