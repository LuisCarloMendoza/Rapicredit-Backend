import express from 'express';
import { tasaController } from '../controllers/tasa.controller.js';

const router = express.Router();

router.post('/', tasaController.createTasa);
router.put('/id/:id', tasaController.updateById);
router.put('/nombre/:nombre', tasaController.updateByNombre);
router.get('/', tasaController.getAll);
router.get('/id/:id', tasaController.getById);
router.get('/nombre/:nombre', tasaController.getByNombre);

export default router;
