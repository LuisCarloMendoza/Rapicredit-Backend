import { tasaService } from '../services/tasa.service.js';

export const tasaController = {
  createTasa: async (req, res) => {
    try {
      const payload = req.body;
      const created = await tasaService.createTasa(payload);
      res.status(201).json(created);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  updateByNombre: async (req, res) => {
    try {
      const nombre = req.params.nombre;
      const updateData = req.body;
      const updated = await tasaService.updateByNombre(nombre, updateData);
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  updateById: async (req, res) => {
    try {
      const id = req.params.id;
      const updateData = req.body;
      const updated = await tasaService.updateById(id, updateData);
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  updateByCodigo: async (req, res) => {
    try {
      const codigo = req.params.codigo;
      const updateData = req.body;
      const updated = await tasaService.updateByCodigo(codigo, updateData);
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const list = await tasaService.getAll();
      res.status(200).json(list);
    } catch (error) {
      res.status(403).json({ message: error.message });
    }
  },

  getByNombre: async (req, res) => {
    try {
      const nombre = req.params.nombre;
      const item = await tasaService.getByNombre(nombre);
      res.status(200).json(item);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  },

  getByCodigo: async (req, res) => {
    try {
      const codigo = req.params.codigo;
      const item = await tasaService.getByCodigo(codigo);
      res.status(200).json(item);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const id = req.params.id;
      const item = await tasaService.getById(id);
      res.status(200).json(item);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  },

  deleteByCodigo: async (req, res) => {
    try {
      const codigo = req.params.codigo;
      await tasaService.deleteByCodigo(codigo);
      res.status(204).end();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};
