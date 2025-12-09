import express from 'express';
import { financiamientoController } from '../controllers/financiamiento.controller.js';
import { requirePermiso } from '../middleware/requirePermiso.js';

const financiamientosRouter = express.Router();

financiamientosRouter.post('/', requirePermiso('Gestionar creditos'), financiamientoController.createFinanciamiento);
financiamientosRouter.put('/:codigoFinanciamiento', requirePermiso('Gestionar creditos'), financiamientoController.updateFinanciamientoByCodigo);
financiamientosRouter.get('/', requirePermiso('Ver/Buscar creditos'), financiamientoController.getAllFinanciamientos);
financiamientosRouter.get('/:codigoFinanciamiento', requirePermiso('Ver/Buscar creditos'), financiamientoController.getFinanciamientoByCodigo);
// Convenience: get by ObjectId
financiamientosRouter.get('/id/:id', requirePermiso('Ver/Buscar creditos'), financiamientoController.getFinanciamientoById);
financiamientosRouter.delete('/:codigoFinanciamiento', requirePermiso('Gestionar creditos'), financiamientoController.deleteFinanciamientoByCodigo);

export default financiamientosRouter;
