import express from 'express';
import { tasaController } from '../controllers/tasa.controller.js';

const router = express.Router();

router.post('/', tasaController.createTasa);
router.put('/codigo/:codigo', tasaController.updateByCodigo);
router.put('/id/:id', tasaController.updateById);
router.put('/:nombre', tasaController.updateByNombre);
router.get('/', tasaController.getAll);
router.get('/codigo/:codigo', tasaController.getByCodigo);
router.get('/id/:id', tasaController.getById);
router.get('/:nombre', tasaController.getByNombre);

export default router;
