import { Router } from 'express';
import MontadoraController from '../controllers/montadora.controller.js';
import { verificarToken, checkRole } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

// Pública: clientes precisam ver a lista para cadastrar seus carros
router.get('/', MontadoraController.listar);

// Protegida: só admin gerencia o catálogo
router.post('/', verificarToken, checkRole(ROLES.ADMIN_MASTER, ROLES.ADMIN), MontadoraController.criar);

export default router;