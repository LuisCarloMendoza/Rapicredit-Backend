import { solicitudService } from '../services/solicitud.service.js';

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
      res.status(403).json({ message: error.message });
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
      res.status(403).json({ message: error.message });
    }
  },

  getSolicitudesByVendedor: async (req, res) => {
    try {
      const vendedorId = req.params.vendedorId;
      const solicitudes = await solicitudService.getSolicitudesByVendedor(vendedorId);
      res.status(200).json(solicitudes);
    } catch (error) {
      res.status(403).json({ message: error.message });
    }
  },

  getSolicitudesByEstado: async (req, res) => {
    try {
      const estadoSolicitud = req.params.estadoSolicitud;
      const solicitudes = await solicitudService.getSolicitudesByEstado(estadoSolicitud);
      res.status(200).json(solicitudes);
    } catch (error) {
      res.status(403).json({ message: error.message });
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
      res.status(403).json({ message: error.message });
    }
  },
};