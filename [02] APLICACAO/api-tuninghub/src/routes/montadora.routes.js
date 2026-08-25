import { Router } from 'express';
import MontadoraController from '../controllers/montadora.controller.js';
import { verificarToken, checkRole } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/', MontadoraController.listar);
router.get('/admin', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN), MontadoraController.listarAdmin);
router.post('/', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN), MontadoraController.criar);
router.put('/:id', verificarToken, checkRole(ROLES.ADMIN_MASTER), MontadoraController.atualizar);
router.delete('/:id', verificarToken, checkRole(ROLES.ADMIN_MASTER), MontadoraController.desativar);
router.patch('/:id/reativar', verificarToken, checkRole(ROLES.ADMIN_MASTER), MontadoraController.reativar);

export default router;