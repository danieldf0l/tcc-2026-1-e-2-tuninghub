import { Router } from 'express';
import EnderecoController from '../controllers/endereco.controller.js';
import { verificarToken, verificarPropriedadeOuAdmin } from '../middlewares/auth.middleware.js';
import { registrarAcao } from '../middlewares/registrarAcao.middleware.js';

const router = Router();

router.get('/:idOficina', EnderecoController.buscar);
router.post('/:idOficina', verificarToken, verificarPropriedadeOuAdmin('idOficina'),
  registrarAcao('EDITOU_ENDERECO_OFICINA', 'oficina', 'idOficina'), EnderecoController.salvar);

export default router;