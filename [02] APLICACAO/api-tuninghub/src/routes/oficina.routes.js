import { Router } from 'express';
import OficinaController from '../controllers/oficina.controller.js';

const router = Router();
router.get('/buscar', OficinaController.buscar);
router.get('/', OficinaController.listar);
router.post('/', OficinaController.criar);

router.get('/', OficinaController.listar);
router.post('/', OficinaController.criar);

export default router;