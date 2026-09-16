import { Router } from 'express';
import OficinaController from '../controllers/oficina.controller.js';
import { verificarToken, checkRole } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/buscar', OficinaController.buscar);
router.get('/', OficinaController.listar);
router.post('/', OficinaController.criar);
router.patch('/aceitar-termos', verificarToken, checkRole(ROLES.OFICINA), OficinaController.aceitarTermos);
router.get('/admin', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN), OficinaController.listarAdmin);
router.put('/:id/faixa-preco', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN), OficinaController.atualizarFaixaPreco);
router.delete('/:id', verificarToken, checkRole(ROLES.ADMIN_MASTER), OficinaController.desativar);
router.patch('/:id/reativar', verificarToken, checkRole(ROLES.ADMIN_MASTER), OficinaController.reativar);

export default router;