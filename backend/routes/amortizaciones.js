import express from 'express';
import { amortizacionController } from '../controllers/amortizacion.controller.js';

const router = express.Router();

// Create amortizacion item
router.post('/', amortizacionController.create);

// List amortizaciones for a financiamiento
router.get('/financiamiento/:financiamientoId', amortizacionController.getByFinanciamientoId);

// Single amortizacion operations
router.get('/:id', amortizacionController.getById);
router.put('/:id', amortizacionController.updateById);
router.delete('/:id', amortizacionController.deleteById);

// Generate amortization schedule
router.post('/generate', amortizacionController.generateAmortizacion); 

export default router;
