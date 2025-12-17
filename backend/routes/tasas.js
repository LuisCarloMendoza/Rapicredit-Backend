import express from 'express';
import { tasaController } from '../controllers/tasa.controller.js';

const router = express.Router();

router.post('/', tasaController.createTasa);
router.put('/id/:id', tasaController.updateById);
router.put('/nombre/:nombre', tasaController.updateByNombre);
// Actualizar por codigoTasa
router.put('/codigo/:codigoTasa', tasaController.updateByCodigoTasa);
// Toggle vigente por codigoTasa (true<->false)
router.put('/vigente/:codigoTasa', tasaController.toggleVigenteByCodigoTasa);
router.get('/', tasaController.getAll);
router.get('/id/:id', tasaController.getById);
router.get('/nombre/:nombre', tasaController.getByNombre);
// Obtener por codigoTasa (activos e inactivos)
router.get('/codigo/:codigoTasa', tasaController.getByCodigoTasa);
// Listado ligero de tasas (activos e inactivos)
router.get('/codigos', tasaController.getCodigos);
// Obtener todas las tasas (activos e inactivos)
router.get('/all', tasaController.getAllAll);

export default router;
