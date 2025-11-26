import { frecuenciaService } from '../services/frecuencia.service.js';

export const frecuenciaController = {
  createFrecuencia: async (req, res) => {
    try {
      const payload = req.body;
      const created = await frecuenciaService.createFrecuencia(payload);
      res.status(201).json(created);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  updateByCodigo: async (req, res) => {
    try {
      const codigo = req.params.codigo;
      const updateData = req.body;
      const updated = await frecuenciaService.updateByCodigo(codigo, updateData);
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  updateById: async (req, res) => {
    try {
      const id = req.params.id;
      const updateData = req.body;
      const updated = await frecuenciaService.updateById(id, updateData);
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const list = await frecuenciaService.getAll();
      res.status(200).json(list);
    } catch (error) {
      res.status(403).json({ message: error.message });
    }
  },

  getByCodigo: async (req, res) => {
    try {
      const codigo = req.params.codigo;
      const item = await frecuenciaService.getByCodigo(codigo);
      res.status(200).json(item);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const id = req.params.id;
      const item = await frecuenciaService.getById(id);
      res.status(200).json(item);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
};
