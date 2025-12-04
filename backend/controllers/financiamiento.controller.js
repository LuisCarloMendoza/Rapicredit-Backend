import { financiamientoService } from "../services/financiamiento.service.js";

export const financiamientoController = {
  createFinanciamiento: async (req, res) => {
    try {
      const payload = req.body;
      const created = await financiamientoService.createFinanciamiento(payload);
      res.status(201).json(created);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  updateFinanciamientoByCodigo: async (req, res) => {
    try {
      const codigoFinanciamiento = req.params.codigoFinanciamiento;
      const updateData = req.body;
      const updated = await financiamientoService.updateFinanciamientoByCodigo(codigoFinanciamiento, updateData);
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

    getAllFinanciamientos: async (req, res) => {
    try {
      const filtros = {
        // /api/financiamientos?estado=VIGENTE
        estado: req.query.estado || null,
        // /api/financiamientos?busqueda=0801...
        busqueda: req.query.busqueda || null,
        // /api/financiamientos?ordenarPor=MONTO_MAYOR
        ordenarPor: req.query.ordenarPor || null,
      };

      const list = await financiamientoService.getAllFinanciamientos(filtros);
      res.status(200).json(list);
    } catch (error) {
      res.status(403).json({ message: error.message });
    }
  },


  getFinanciamientoByCodigo: async (req, res) => {
    try {
      const codigoFinanciamiento = req.params.codigoFinanciamiento;
      const item = await financiamientoService.getFinanciamientoByCodigo(codigoFinanciamiento);
      res.status(200).json(item);
    } catch (error) {
      res.status(403).json({ message: error.message });
    }
  },

  getFinanciamientoById: async (req, res) => {
    try {
      const id = req.params.id;
      const item = await financiamientoService.getFinanciamientoById(id);
      res.status(200).json(item);
    } catch (error) {
      res.status(403).json({ message: error.message });
    }
  },

  deleteFinanciamientoByCodigo: async (req, res) => {
    try {
      const codigoFinanciamiento = req.params.codigoFinanciamiento;
      await financiamientoService.deleteFinanciamientoByCodigo(codigoFinanciamiento);
      res.status(204).end();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};
