import { pagoService } from '../services/pago.service.js';

export const pagoController = {
  createPago: async (req, res) => {
    try {
      const payload = req.body;
      const created = await pagoService.createPago(payload);
      res.status(201).json(created);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getByFinanciamientoId: async (req, res) => {
    try {
      const financiamientoId = req.params.financiamientoId;
      const list = await pagoService.getByFinanciamientoId(financiamientoId);
      res.status(200).json(list);
    } catch (error) {
      res.status(403).json({ message: error.message });
    }
  },

  getByClienteId: async (req, res) => {
    try {
      const clienteId = req.params.clienteId;
      const list = await pagoService.getByClienteId(clienteId);
      res.status(200).json(list);
    } catch (error) {
      res.status(403).json({ message: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const id = req.params.id;
      const item = await pagoService.getById(id);
      res.status(200).json(item);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  },

  getByCodigo: async (req, res) => {
    try {
      const codigo = req.params.codigo;
      const item = await pagoService.getByCodigo(codigo);
      res.status(200).json(item);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const list = await pagoService.getAll();
      res.status(200).json(list);
    } catch (error) {
      res.status(403).json({ message: error.message });
    }
  },

  updateById: async (req, res) => {
    try {
      const id = req.params.id;
      const updateData = req.body;
      const updated = await pagoService.updateById(id, updateData);
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  updateByCodigo: async (req, res) => {
    try {
      const codigo = req.params.codigo;
      const updateData = req.body;
      const updated = await pagoService.updateByCodigo(codigo, updateData);
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // ==== NUEVO: GET /api/pagos/hoy ====
  getPagosHoy: async (req, res) => {
    try {
      const pagos = await pagoService.getPagosHoy();
      res.status(200).json(pagos);
    } catch (error) {
      console.error("Error en getPagosHoy:", error);
      res.status(500).json({ message: "Error al obtener pagos de hoy" });
    }
  },

  // ==== NUEVO: GET /api/pagos/rango?desde=YYYY-MM-DD&hasta=YYYY-MM-DD ====
  getPagosPorRango: async (req, res) => {
    try {
      const { desde, hasta } = req.query;
      const pagos = await pagoService.getPagosPorRango(desde, hasta);
      res.status(200).json(pagos);
    } catch (error) {
      console.error("Error en getPagosPorRango:", error);
      res.status(500).json({ message: "Error al obtener pagos por rango de fechas" });
    }
  },


  deleteById: async (req, res) => {
    try {
      const id = req.params.id;
      await pagoService.deleteById(id);
      res.status(204).end();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  deleteByCodigo: async (req, res) => {
    try {
      const codigo = req.params.codigo;
      await pagoService.deleteByCodigo(codigo);
      res.status(204).end();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};
