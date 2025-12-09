import express from 'express';
import { reportesController } from '../controllers/reportes.controller.js';
import { reportesExcelController } from '../controllers/reportesExcel.controller.js';

const reportesRouter = express.Router();

// Excel (uno, varios o todos vía query 'types')
reportesRouter.get('/excel', reportesExcelController.getExcel);

// Cartera actual (agrupada por estado y producto)
reportesRouter.get('/cartera-actual', reportesController.getCarteraActual);

// Mora por días (default 30)
reportesRouter.get('/mora', reportesController.getMora);

// Colocación mensual en un rango de fechas
reportesRouter.get('/colocacion-mensual', reportesController.getColocacionMensual);

export default reportesRouter;
