import express from 'express';
import { frecuenciaController } from '../controllers/frecuencia.controller.js';

const router = express.Router();

router.post('/', frecuenciaController.createFrecuencia);
router.put('/codigo/:codigo', frecuenciaController.updateByCodigo);
router.put('/id/:id', frecuenciaController.updateById);
router.get('/', frecuenciaController.getAll);
router.get('/codigo/:codigo', frecuenciaController.getByCodigo);
router.get('/id/:id', frecuenciaController.getById);

export default router;
