import express from 'express';
import { gastoController } from '../controllers/gasto.controller.js';

const router = express.Router();

router.post('/', gastoController.createGasto);
router.get('/codigo/:codigo', gastoController.getByCodigo);
router.get('/financiamiento/:financiamientoId', gastoController.getByFinanciamientoId);
router.get('/:id', gastoController.getById);
router.get('/', gastoController.getAll);
router.put('/codigo/:codigo', gastoController.updateByCodigo);
router.put('/:id', gastoController.updateById);
router.delete('/:id', gastoController.deleteById);

export default router;
