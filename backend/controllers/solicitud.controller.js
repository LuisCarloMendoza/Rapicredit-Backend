import { solicitudService } from '../services/solicitud.service.js';
import Solicitud from '../models/solicitud.model.js';
import { generarPdfSolicitud } from '../services/solicitudPDF.service.js';

const getSolicitudRawByCodigo = async (codigoSolicitud) => {
  const solicitud = await Solicitud.findOne({ codigoSolicitud })
    .populate("clienteId")
    .populate("vendedorId");

  if (!solicitud) return null;

  return {
    ...solicitud.toObject(), // uso toObject() para obtener un objeto plano
    cliente: solicitud.clienteId,
    vendedor: solicitud.vendedorId,
  };
};

export const solicitudController = {
  createSolicitud: async (req, res) => {
    try {
      const solicitudData = req.body;
      const newSolicitud = await solicitudService.createSolicitud(solicitudData);
      res.status(201).json(newSolicitud);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  updateSolicitudByCodigo: async (req, res) => {
    try {
      const codigoSolicitud = req.params.codigoSolicitud;
      const updateData = req.body;
      const updatedSolicitud = await solicitudService.updateSolicitudByCodigo(codigoSolicitud, updateData);
      res.status(200).json(updatedSolicitud);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getAllSolicitudes: async (req, res) => {
    try {
      const solicitudes = await solicitudService.getAllSolicitudes();
      res.status(200).json(solicitudes);
    } catch (error) {
      res.status(403).json({ message: error.message });
    }
  },

  getSolicitudByCodigo: async (req, res) => {
    try {
      const codigoSolicitud = req.params.codigoSolicitud;
      const solicitud = await solicitudService.getSolicitudByCodigo(codigoSolicitud);
      res.status(200).json(solicitud);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  deleteSolicitudByCodigo: async (req, res) => {
    try {
      const codigoSolicitud = req.params.codigoSolicitud;
      const result = await solicitudService.deleteSolicitudByCodigo(codigoSolicitud);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getSolicitudesByCliente: async (req, res) => {
    try {
      const clienteId = req.params.clienteId;
      const solicitudes = await solicitudService.getSolicitudesByCliente(clienteId);
      res.status(200).json(solicitudes);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getSolicitudesByVendedor: async (req, res) => {
    try {
      const vendedorId = req.params.vendedorId;
      const solicitudes = await solicitudService.getSolicitudesByVendedor(vendedorId);
      res.status(200).json(solicitudes);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getSolicitudesByEstado: async (req, res) => {
    try {
      const estadoSolicitud = req.params.estadoSolicitud;
      const solicitudes = await solicitudService.getSolicitudesByEstado(estadoSolicitud);
      res.status(200).json(solicitudes);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  changeSolicitudStatus: async (req, res) => {
    try {
      const codigoSolicitud = req.params.codigoSolicitud;
      const statusData = req.body;
      const updatedSolicitud = await solicitudService.changeSolicitudStatus(codigoSolicitud, statusData);
      res.status(200).json(updatedSolicitud);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  filterSolicitudes: async (req, res) => {
    try {
      const filters = req.query;
      const solicitudes = await solicitudService.filterSolicitudes(filters);
      res.status(200).json(solicitudes);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getAllSolicitudes: async (req, res) => {
    try {
      const solicitudes = await solicitudService.getAllSolicitudes();
      res.status(200).json(solicitudes);
    } catch (error) {
      res.status(403).json({ message: error.message });
    }
  },

  generateApprovedReport: async (req, res) => {
    try {
      // Accept parameters from query or body: { frequency: 'weekly'|'monthly'|'quarterly'|'yearly', from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }
      const params = { ...req.query, ...req.body };
      const { frequency = 'monthly', from, to } = params || {};
      const { solicitudReportService } = await import('../services/solicitudReport.service.js');
      const buffer = await solicitudReportService.generateApprovedSolicitudesWorkbook({ frequency, from, to });

      const fromLabel = from ? String(from).replace(/:/g, '') : 'any';
      const toLabel = to ? String(to).replace(/:/g, '') : 'any';
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="solicitudes_aprobadas_${frequency}_${fromLabel}_${toLabel}.xlsx"`);
      res.status(200).send(Buffer.from(buffer));
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  //Exponer el helper para que el router pueda usarlo en la generación del PDF
  getSolicitudRawByCodigo,

  exportPdfByCodigo: async (req, res) => {
    try {
      const codigoSolicitud = req.params.codigoSolicitud;
      const raw = await getSolicitudRawByCodigo(codigoSolicitud);
      if (!raw) return res.status(404).json({ message: 'Solicitud no encontrada' });

      const { cliente, vendedor } = raw;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=solicitud_${codigoSolicitud}.pdf`);

      const pdfDoc = generarPdfSolicitud(raw, cliente, vendedor);
      pdfDoc.pipe(res);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      res.status(500).json({ message: 'Error generating PDF' });
    }
  },
  // Método para aprobar una solicitud
  async aprobar(req, res) {
    try {
      // Tomamos el ID de la solicitud desde los parámetros
      const { id } = req.params;

      // Tomamos el ID del usuario que está aprobando la solicitud
      const usuarioDecisionId = req.currentUser?.id || null;

      // Llamamos al servicio que procesa la aprobación
      const result = await solicitudService.aprobarSolicitud({
        solicitudId: id,
        usuarioDecisionId,
      });

      // Respondemos con el resultado
      return res.status(200).json({
        message: "Solicitud aprobada y préstamo creado",
        ...result,
      });
    } catch (err) {
      console.error("Error al aprobar la solicitud:", err);
      return res.status(400).json({ message: err.message || "Error al aprobar solicitud" });
    }
  },
};