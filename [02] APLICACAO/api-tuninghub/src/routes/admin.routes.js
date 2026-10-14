import { Router } from 'express';
import AdminController from '../controllers/admin.controller.js';
import { verificarToken, checkRole } from '../middlewares/auth.middleware.js';
import { registrarAcao } from '../middlewares/registrarAcao.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN), AdminController.listar);
router.get('/logs', verificarToken, checkRole(ROLES.ADMIN_MASTER), AdminController.listarLogs);

router.post('/', verificarToken, checkRole(ROLES.ADMIN_MASTER),
  registrarAcao('CRIOU_ADMIN', 'admin'), AdminController.criar);

router.put('/:id', verificarToken, checkRole(ROLES.ADMIN_MASTER),
  registrarAcao('EDITOU_ADMIN', 'admin'), AdminController.atualizar);

router.patch('/:id/status', verificarToken, checkRole(ROLES.ADMIN_MASTER),
  registrarAcao((req) => (req.body?.ativo ? 'REATIVOU_ADMIN' : 'DESATIVOU_ADMIN'), 'admin'),
  AdminController.atualizarStatus);

export default router;