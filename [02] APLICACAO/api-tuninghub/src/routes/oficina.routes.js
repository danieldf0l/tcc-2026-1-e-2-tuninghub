import { Router } from 'express';
import OficinaController from '../controllers/oficina.controller.js';
import { verificarToken, checkRole } from '../middlewares/auth.middleware.js';
import { contaLimiter } from '../middlewares/contaLimiter.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/buscar', OficinaController.buscar);
router.get('/admin', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN), OficinaController.listarAdmin);
router.get('/', OficinaController.listar);
router.post('/', OficinaController.criar);

// "Meus Dados" (oficina logada) — o id vem sempre do token
router.get('/me', verificarToken, checkRole(ROLES.OFICINA), OficinaController.meusDados);
router.put('/me', verificarToken, checkRole(ROLES.OFICINA), contaLimiter, OficinaController.atualizarMeusDados);
// 2ª etapa da troca de e-mail: confirma o código enviado ao e-mail novo
router.post('/me/confirmar-email', verificarToken, checkRole(ROLES.OFICINA), contaLimiter, OficinaController.confirmarTrocaEmail);
router.patch('/me/senha', verificarToken, checkRole(ROLES.OFICINA), contaLimiter, OficinaController.alterarSenha);
router.patch('/me/faixa-preco', verificarToken, checkRole(ROLES.OFICINA), OficinaController.atualizarMinhaFaixaPreco);
// Exclusão física da própria conta (LGPD). DEVE ficar antes de DELETE /:id, senão "me" vira :id.
router.delete('/me', verificarToken, checkRole(ROLES.OFICINA), contaLimiter, OficinaController.excluirMinhaConta);

router.patch('/aceitar-termos', verificarToken, checkRole(ROLES.OFICINA), OficinaController.aceitarTermos);
router.put('/:id/faixa-preco', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN), OficinaController.atualizarFaixaPreco);
router.delete('/:id', verificarToken, checkRole(ROLES.ADMIN_MASTER), OficinaController.desativar);
router.patch('/:id/reativar', verificarToken, checkRole(ROLES.ADMIN_MASTER), OficinaController.reativar);

export default router;