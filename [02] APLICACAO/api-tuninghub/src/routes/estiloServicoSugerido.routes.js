import { Router } from 'express';
import EstiloServicoSugeridoController from '../controllers/estiloServicoSugerido.controller.js';
import { verificarToken, checkRole } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/:estilo', EstiloServicoSugeridoController.listar); // pública, útil pro app mostrar o "kit" antes de criar o projeto
router.post('/', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN), EstiloServicoSugeridoController.vincular);
router.delete('/:estilo/:idServico', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN), EstiloServicoSugeridoController.desvincular);

export default router;