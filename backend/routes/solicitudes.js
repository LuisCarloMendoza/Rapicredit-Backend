import express from 'express';
import { solicitudController } from '../controllers/solicitud.controller.js';

const router = express.Router();

// CRUD básicos
router.post('/', solicitudController.createSolicitud);
router.get('/', solicitudController.filterSolicitudes); // Con query params para filtros
router.get('/:codigoSolicitud', solicitudController.getSolicitudByCodigo);
router.put('/:codigoSolicitud', solicitudController.updateSolicitudByCodigo);
router.delete('/:codigoSolicitud', solicitudController.deleteSolicitudByCodigo);

// Filtros específicos
router.get('/cliente/:clienteId', solicitudController.getSolicitudesByCliente);
router.get('/vendedor/:vendedorId', solicitudController.getSolicitudesByVendedor);
router.get('/estado/:estadoSolicitud', solicitudController.getSolicitudesByEstado);

// Cambio de estado
router.patch('/:codigoSolicitud/status', solicitudController.changeSolicitudStatus);

export default router;