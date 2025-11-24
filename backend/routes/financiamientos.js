import express from 'express';
import { financiamientoController } from '../controllers/financiamiento.controller.js';

const financiamientosRouter = express.Router();

financiamientosRouter.post('/', financiamientoController.createFinanciamiento);
financiamientosRouter.put('/:codigoFinanciamiento', financiamientoController.updateFinanciamientoByCodigo);
financiamientosRouter.get('/', financiamientoController.getAllFinanciamientos);
financiamientosRouter.get('/:codigoFinanciamiento', financiamientoController.getFinanciamientoByCodigo);
// Convenience: get by ObjectId
financiamientosRouter.get('/id/:id', financiamientoController.getFinanciamientoById);

export default financiamientosRouter;
