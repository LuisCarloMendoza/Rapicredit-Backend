import { gastoService } from '../services/gasto.service.js';

export const gastoController = {
  createGasto: async (req, res) => {
    try {
      const payload = req.body;
      const created = await gastoService.createGasto(payload);
      res.status(201).json(created);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const id = req.params.id;
      const item = await gastoService.getById(id);
      res.status(200).json(item);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  },

  getByCodigo: async (req, res) => {
    try {
      const codigo = req.params.codigo;
      const item = await gastoService.getByCodigo(codigo);
      res.status(200).json(item);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  },

  getByFinanciamientoId: async (req, res) => {
    try {
      const financiamientoId = req.params.financiamientoId;
      const list = await gastoService.getByFinanciamientoId(financiamientoId);
      res.status(200).json(list);
    } catch (error) {
      res.status(403).json({ message: error.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const list = await gastoService.getAll();
      res.status(200).json(list);
    } catch (error) {
      res.status(403).json({ message: error.message });
    }
  },

  updateById: async (req, res) => {
    try {
      const id = req.params.id;
      const updateData = req.body;
      const updated = await gastoService.updateById(id, updateData);
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  updateByCodigo: async (req, res) => {
    try {
      const codigo = req.params.codigo;
      const updateData = req.body;
      const updated = await gastoService.updateByCodigo(codigo, updateData);
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  deleteById: async (req, res) => {
    try {
      const id = req.params.id;
      await gastoService.deleteById(id);
      res.status(204).end();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};
