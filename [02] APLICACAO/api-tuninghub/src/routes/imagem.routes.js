import { Router } from 'express';
import ImagemController from '../controllers/imagem.controller.js';
import { verificarToken, checkRole } from '../middlewares/auth.middleware.js';
import { uploadImagemMiddleware } from '../middlewares/upload.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/oficina/:idOficina', ImagemController.listar);
router.post('/', verificarToken, checkRole(ROLES.OFICINA, ROLES.ADMIN_MASTER, ROLES.ADMIN), uploadImagemMiddleware, ImagemController.criar);
router.delete('/:id', verificarToken, ImagemController.remover);

export default router;