import { Router } from 'express';
import OficinaController from '../controllers/oficina.controller.js';
import { verificarToken, checkRole } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/buscar', OficinaController.buscar);
router.get('/', OficinaController.listar);
router.post('/', OficinaController.criar);
router.patch('/aceitar-termos', verificarToken, checkRole(ROLES.OFICINA), OficinaController.aceitarTermos);

export default router;