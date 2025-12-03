import express from 'express';
import { frecuenciaController } from '../controllers/frecuencia.controller.js';

const router = express.Router();

router.post('/', frecuenciaController.createFrecuencia);
router.put('/codigo/:codigo', frecuenciaController.updateByCodigo);
router.put('/id/:id', frecuenciaController.updateById);
router.get('/', frecuenciaController.getAll);
router.get('/codigo/:codigo', frecuenciaController.getByCodigo);
router.get('/id/:id', frecuenciaController.getById);
router.delete('/codigo/:codigo', frecuenciaController.deleteByCodigo);
router.delete('/id/:id', frecuenciaController.deleteById);

export default router;
