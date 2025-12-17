import express from 'express';
import { solicitudController } from '../controllers/solicitud.controller.js';
import { generarPdfSolicitud } from '../services/solicitudPDF.service.js';

import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken.js"; // asegúrate de que este middleware existe
import { requirePermiso } from "../middleware/requirePermiso.js"; // Asegúrate que este middleware también existe


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
router.get('/', solicitudController.getAllSolicitudes);

router.patch('/:codigoSolicitud/status', solicitudController.changeSolicitudStatus);

// Esta ruta permite al admin aprobar la solicitud (requiere permiso)
router.post(
    "/:id/aprobar",  // La ruta que llamará a aprobar la solicitud
    //verifyFirebaseToken,  // Verificación del token del usuario
    //requirePermiso("Gestionar solicitudes"),  // Se asegura que el usuario tenga el permiso adecuado
    solicitudController.aprobar  // Método que maneja la aprobación
);

export default router;