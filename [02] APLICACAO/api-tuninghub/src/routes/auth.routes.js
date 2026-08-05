import { Router } from 'express';
import AuthController from '../controllers/auth.controller.js';

const router = Router();

router.post('/login/usuario', AuthController.loginUsuario);
router.post('/login/oficina', AuthController.loginOficina);
router.post('/login/admin', AuthController.loginAdmin);

export default router;