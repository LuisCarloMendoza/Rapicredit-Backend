import express from 'express';
import { dashboardController } from '../controllers/dashboard.controller.js';

const dashboardRouter = express.Router();

// GET /api/dashboard/resumen
dashboardRouter.get('/resumen', dashboardController.getResumen);

export default dashboardRouter;
