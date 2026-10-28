import { Router } from 'express';
import AuthController from '../controllers/auth.controller.js';

const router = Router();

router.post('/login/usuario', AuthController.loginUsuario);
router.post('/login/oficina', AuthController.loginOficina);
router.post('/login/admin', AuthController.loginAdmin);

// Confirmação de e-mail do cadastro (usuário e oficina)
router.post('/verificar-email', AuthController.verificarEmail);
router.post('/reenviar-codigo', AuthController.reenviarCodigo);

// Recuperação de senha (usuário e oficina)
router.post('/esqueci-senha', AuthController.esqueciSenha);
router.post('/redefinir-senha', AuthController.redefinirSenha);

export default router;