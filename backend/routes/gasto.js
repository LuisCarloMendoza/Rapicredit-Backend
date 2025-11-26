import express from 'express';
import { gastoController } from '../controllers/gasto.controller.js';

const gastoRouter = express.Router();

// POST/PUT/DELETE básicos (higher priority)
gastoRouter.post('/', gastoController.createGasto);

// GET Filtros específicos (MUST be before generic :codigoGasto)
gastoRouter.get('/cobrador/:cobradorId', gastoController.getGastosByCobradorId);
gastoRouter.get('/financiamiento/:financiamientoId', gastoController.getGastosByFinanciamientoId);
gastoRouter.get('/tipo/:tipoGasto', gastoController.getGastosByTipo);
gastoRouter.get('/rango-fechas', gastoController.getGastosByFechaRango);

// Operaciones por ID (secondary)
gastoRouter.get('/id/:id', gastoController.getGastoById);
gastoRouter.put('/id/:id', gastoController.updateGastoById);
gastoRouter.delete('/id/:id', gastoController.deleteGastoById);

// Generic GET/PUT/DELETE (LAST - least specific)
gastoRouter.get('/', gastoController.filterGastos);
gastoRouter.get('/:codigoGasto', gastoController.getGastoByCodigoGasto);
gastoRouter.put('/:codigoGasto', gastoController.updateGastoByCodigoGasto);
gastoRouter.delete('/:codigoGasto', gastoController.deleteGastoByCodigoGasto);

export default gastoRouter;