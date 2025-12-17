import express from 'express';
import { prestamoController } from '../controllers/prestamo.controller.js';
import { requirePermiso } from '../middleware/requirePermiso.js';

const prestamoRouter = express.Router();

// Crear préstamo
//prestamoRouter.post('/', requirePermiso('Gestionar creditos'), prestamoController.createPrestamo);

// Actualizar préstamo por código
prestamoRouter.put('/:codigoPrestamo', requirePermiso('Gestionar creditos'), prestamoController.updatePrestamoByCodigo);

// Obtener todos los préstamos
prestamoRouter.get('/', requirePermiso('Ver/Buscar creditos'), prestamoController.getAllPrestamos);

// Obtener un préstamo por código
prestamoRouter.get('/:codigoPrestamo', requirePermiso('Ver/Buscar creditos'), prestamoController.getPrestamoByCodigo);

// Obtener un préstamo por ID (opcional, si prefieres trabajar con ObjectId)
prestamoRouter.get('/id/:id', requirePermiso('Ver/Buscar creditos'), prestamoController.getPrestamoById);

// Eliminar préstamo por código
prestamoRouter.delete('/:codigoPrestamo', requirePermiso('Gestionar creditos'), prestamoController.deletePrestamoByCodigo);

// Resumen de los préstamos (similar a "getFinanciamientosResumen" en financiamiento)
prestamoRouter.get('/resumen', requirePermiso('Ver/Buscar creditos'), prestamoController.getPrestamosResumen);

// Detalle completo de un préstamo (similar a "getFinanciamientoDetalle" en financiamiento)
prestamoRouter.get('/:id/detalle', requirePermiso('Ver/Buscar creditos'), prestamoController.getPrestamoDetalleById);

export default prestamoRouter;
