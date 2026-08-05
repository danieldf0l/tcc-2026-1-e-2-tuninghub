import { Router } from 'express';
import EnderecoController from '../controllers/endereco.controller.js';
import { verificarToken, verificarPropriedadeOuAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/:idOficina', EnderecoController.buscar);
router.post('/:idOficina', verificarToken, verificarPropriedadeOuAdmin('idOficina'), EnderecoController.salvar);

export default router;  