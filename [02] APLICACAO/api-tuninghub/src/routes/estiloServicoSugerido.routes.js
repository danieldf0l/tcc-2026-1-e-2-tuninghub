import { Router } from 'express';
import EstiloServicoSugeridoController from '../controllers/estiloServicoSugerido.controller.js';
import { verificarToken, checkRole } from '../middlewares/auth.middleware.js';
import { registrarAcao } from '../middlewares/registrarAcao.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/:estilo', EstiloServicoSugeridoController.listar); // pública, útil pro app mostrar o "kit" antes de criar o projeto
router.post('/', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN),
  registrarAcao('VINCULOU_SERVICO_ESTILO', 'estiloservicosugerido'), EstiloServicoSugeridoController.vincular);
// IdReferencia do log = id do serviço (o estilo é um código de texto e não cabe no campo)
router.delete('/:estilo/:idServico', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN),
  registrarAcao('DESVINCULOU_SERVICO_ESTILO', 'estiloservicosugerido', 'idServico'), EstiloServicoSugeridoController.desvincular);

export default router;