import express from 'express';
import { abonoController } from '../controllers/abono.controller.js';

const router = express.Router();

router.post('/', abonoController.createAbono);
router.get('/financiamiento/:financiamientoId', abonoController.getByFinanciamientoId);
router.get('/cliente/:clienteId', abonoController.getByClienteId);
// lookup by codigoAbono
router.get('/codigo/:codigo', abonoController.getByCodigo);
router.get('/:id', abonoController.getById);
router.get('/', abonoController.getAll);
// update by codigoAbono
router.put('/codigo/:codigo', abonoController.updateByCodigo);
router.put('/:id', abonoController.updateById);
router.delete('/codigo/:codigo', abonoController.deleteByCodigo);
router.delete('/:id', abonoController.deleteById);

export default router;
