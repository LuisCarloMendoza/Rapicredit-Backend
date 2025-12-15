import express from 'express';
import { pagoController } from '../controllers/pago.controller.js';

const router = express.Router();

router.post('/', pagoController.createPago);
router.get('/financiamiento/:financiamientoId', pagoController.getByFinanciamientoId);
router.get('/cliente/:clienteId', pagoController.getByClienteId);
// lookup by codigoPago
router.get('/codigo/:codigo', pagoController.getByCodigo);
router.get('/:id', pagoController.getById);
router.get('/', pagoController.getAll);
// update by codigoPago
router.put('/codigo/:codigo', pagoController.updateByCodigo);
router.put('/:id', pagoController.updateById);
router.delete('/codigo/:codigo', pagoController.deleteByCodigo);
router.delete('/:id', pagoController.deleteById);

// Pagos de hoy
router.get('/hoy', pagoController.getPagosHoy);

// Pagos por rango de fechas ?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
router.get('/rango', pagoController.getPagosPorRango);


export default router;
