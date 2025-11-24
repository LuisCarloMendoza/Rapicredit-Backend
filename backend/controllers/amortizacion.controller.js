import { amortizacionService } from "../services/amortizacion.service.js";

export const amortizacionController = {
  create: async (req, res) => {
    try {
      const payload = req.body;
      const created = await amortizacionService.create(payload);
      res.status(201).json(created);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getByFinanciamientoId: async (req, res) => {
    try {
      const financiamientoId = req.params.financiamientoId;
      const list = await amortizacionService.getByFinanciamientoId(financiamientoId);
      res.status(200).json(list);
    } catch (error) {
      res.status(403).json({ message: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const id = req.params.id;
      const item = await amortizacionService.getById(id);
      res.status(200).json(item);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  },

  updateById: async (req, res) => {
    try {
      const id = req.params.id;
      const updateData = req.body;
      const updated = await amortizacionService.updateById(id, updateData);
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  deleteById: async (req, res) => {
    try {
      const id = req.params.id;
      await amortizacionService.deleteById(id);
      res.status(204).end();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};
