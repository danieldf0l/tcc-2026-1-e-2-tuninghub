import { Router } from 'express';
import GeolocalizacaoController from '../controllers/geolocalizacao.controller.js';

const router = Router();
router.get('/geocodificar', GeolocalizacaoController.geocodificar);
export default router;