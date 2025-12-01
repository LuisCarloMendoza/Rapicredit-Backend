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

// Generar PDF de solicitud

router.get('/:codigoSolicitud/export/pdf', async (req, res) => {
    try {
        const codigoSolicitud = req.params.codigoSolicitud;

        //Añadí esto porque necesitamos obtener toda la información necesaria
        const solicitud = await solicitudController.getSolicitudRawByCodigo(codigoSolicitud); 
        // NOTA: voy a darte abajo el método getSolicitudRawByCodigo para tu controller.

        if (!solicitud) {
            return res.status(404).json({ message: "Solicitud no encontrada" });
        }

        const { cliente, vendedor } = solicitud;

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `inline; filename=solicitud_${codigoSolicitud}.pdf`
        );

        const pdfDoc = generarPdfSolicitud(solicitud, cliente, vendedor);

        //Añadí esto porque PDFKit usa stream.pipe() para enviar el archivo al cliente
        pdfDoc.pipe(res);

    } catch (error) {
        console.error("Error generando PDF:", error);
        res.status(500).json({ message: "Error generando el PDF de la solicitud" });
    }
});

// CRUD básicos GET (generic, after specific routes)
router.get('/', solicitudController.filterSolicitudes); // Con query params para filtros
router.get('/:codigoSolicitud', solicitudController.getSolicitudByCodigo);

// Cambio de estado
router.patch('/:codigoSolicitud/status', solicitudController.changeSolicitudStatus);

export default router;