import { Router } from 'express';
import AssinaturaController from '../controllers/assinatura.controller.js';
import { verificarToken, checkRole } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN), AssinaturaController.listar);
router.post('/gratuita', verificarToken, checkRole(ROLES.OFICINA, ROLES.ADMIN_MASTER, ROLES.ADMIN), AssinaturaController.criarGratuita);
router.post('/checkout', verificarToken, checkRole(ROLES.OFICINA, ROLES.ADMIN_MASTER, ROLES.ADMIN), AssinaturaController.checkout);
router.post('/:id/confirmar-pagamento', verificarToken, AssinaturaController.confirmarPagamento);
router.get('/minha', verificarToken, checkRole(ROLES.OFICINA), AssinaturaController.minhaAssinatura);

export default router;