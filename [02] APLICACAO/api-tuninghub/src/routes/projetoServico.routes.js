import { Router } from 'express';
import ProjetoServicoController from '../controllers/projetoServico.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/:idProjeto', verificarToken, ProjetoServicoController.listar);
router.post('/', verificarToken, ProjetoServicoController.vincular);
router.delete('/:idProjeto/:idServico', verificarToken, ProjetoServicoController.desvincular);
router.patch('/:idProjeto/:idServico/concluido', verificarToken, ProjetoServicoController.marcarConcluido);

export default router;