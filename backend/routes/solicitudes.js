import express from 'express';
import { solicitudController } from '../controllers/solicitud.controller.js';
import { generarPdfSolicitud } from '../services/solicitudPDF.service.js'; 

const router = express.Router();

// CRUD básicos
router.post('/', solicitudController.createSolicitud);
router.put('/:codigoSolicitud', solicitudController.updateSolicitudByCodigo);
router.delete('/:codigoSolicitud', solicitudController.deleteSolicitudByCodigo);

// Filtros específicos (define before generic :codigoSolicitud to avoid conflicts)
router.get('/cliente/:clienteId', solicitudController.getSolicitudesByCliente);
router.get('/vendedor/:vendedorId', solicitudController.getSolicitudesByVendedor);
router.get('/estado/:estadoSolicitud', solicitudController.getSolicitudesByEstado);

// Generar PDF de solicitud (delegado al controller)
router.get('/:codigoSolicitud/export/pdf', solicitudController.exportPdfByCodigo);

// CRUD básicos GET (generic, after specific routes)
router.post('/report/approved', solicitudController.generateApprovedReport);
router.get('/report/approved', solicitudController.generateApprovedReport);
router.get('/', solicitudController.filterSolicitudes); // Con query params para filtros
router.get('/:codigoSolicitud', solicitudController.getSolicitudByCodigo);

router.patch('/:codigoSolicitud/status', solicitudController.changeSolicitudStatus);

export default router;