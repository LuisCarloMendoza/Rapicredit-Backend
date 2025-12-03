import { parametrosService } from "../services/parametros.service.js";

export const parametrosController = {
  createParametros: async (req, res) => {
    try {
      const payload = req.body;
      const created = await parametrosService.createParametros(payload);
      res.status(201).json(created);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  updateParametrosByCodigo: async (req, res) => {
    try {
      const codigoParametros = req.params.codigoParametros;
      const updateData = req.body;
      const updated = await parametrosService.updateParametrosByCodigo(codigoParametros, updateData);
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getAllParametros: async (req, res) => {
    try {
      const list = await parametrosService.getAllParametros();
      res.status(200).json(list);
    } catch (error) {
      res.status(403).json({ message: error.message });
    }
  },

  getParametrosByCodigo: async (req, res) => {
    try {
      const codigoParametros = req.params.codigoParametros;
      const item = await parametrosService.getParametrosByCodigo(codigoParametros);
      res.status(200).json(item);
    } catch (error) {
      res.status(403).json({ message: error.message });
    }
  },

  deleteParametrosByCodigo: async (req, res) => {
    try {
      const codigoParametros = req.params.codigoParametros;
      await parametrosService.deleteParametrosByCodigo(codigoParametros);
      res.status(204).end();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
};
