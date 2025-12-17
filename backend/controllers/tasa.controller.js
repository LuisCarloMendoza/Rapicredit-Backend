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

  getById: async (req, res) => {
    try {
      const id = req.params.id;
      const item = await tasaService.getById(id);
      res.status(200).json(item);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  },
 
  // Actualizar por codigoTasa
  updateByCodigoTasa: async (req, res) => {
    try {
      const { codigoTasa } = req.params;
      const updateData = req.body;
      const updated = await tasaService.updateByCodigoTasa(codigoTasa, updateData);
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Obtener por codigoTasa (activos e inactivos)
  getByCodigoTasa: async (req, res) => {
    try {
      const { codigoTasa } = req.params;
      const item = await tasaService.getByCodigoTasa(codigoTasa);
      res.status(200).json(item);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  },

  // Toggle vigente por codigoTasa (true <-> false)
  toggleVigenteByCodigoTasa: async (req, res) => {
    try {
      const { codigoTasa } = req.params;
      const updated = await tasaService.toggleVigenteByCodigoTasa(codigoTasa);
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Listado ligero con activos e inactivos
  getCodigos: async (req, res) => {
    try {
      const list = await tasaService.getCodigos();
      res.status(200).json(list);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Todas las tasas (activos e inactivos)
  getAllAll: async (req, res) => {
    try {
      const list = await tasaService.getAllAll();
      res.status(200).json(list);
    } catch (error) {
      res.status(403).json({ message: error.message });
    }
  },
  
};
