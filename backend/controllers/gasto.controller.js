import { gastoService } from "../services/gasto.service.js";

export const gastoController = {
  createGasto: async (req, res) => {
    try {
      const gastoData = req.body;
      const newGasto = await gastoService.createGasto(gastoData);
      res.status(201).json(newGasto);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  updateGastoByCodigoGasto: async (req, res) => {
    try {
      const codigoGasto = req.params.codigoGasto;
      const updateData = req.body;
      const updatedGasto = await gastoService.updateGastoByCodigoGasto(codigoGasto, updateData);
      res.status(200).json(updatedGasto);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  updateGastoById: async (req, res) => {
    try {
      const id = req.params.id;
      const updateData = req.body;
      const updatedGasto = await gastoService.updateGastoById(id, updateData);
      res.status(200).json(updatedGasto);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  deleteGastoByCodigoGasto: async (req, res) => {
    try {
      const codigoGasto = req.params.codigoGasto;
      const result = await gastoService.deleteGastoByCodigoGasto(codigoGasto);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  deleteGastoById: async (req, res) => {
    try {
      const id = req.params.id;
      const result = await gastoService.deleteGastoById(id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getAllGastos: async (req, res) => {
    try {
      const gastos = await gastoService.getAllGastos();
      res.status(200).json(gastos);
    } catch (error) {
      res.status(403).json({ message: error.message });
    }
  },

  getGastoByCodigoGasto: async (req, res) => {
    try {
      const codigoGasto = req.params.codigoGasto;
      const gasto = await gastoService.getGastoByCodigoGasto(codigoGasto);
      res.status(200).json(gasto);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getGastoById: async (req, res) => {
    try {
      const id = req.params.id;
      const gasto = await gastoService.getGastoById(id);
      res.status(200).json(gasto);
    } catch (error) {
      res.status(403).json({ message: error.message });
    }
  },

  getGastosByCobradorId: async (req, res) => {
    try {
      const cobradorId = req.params.cobradorId;
      const gastos = await gastoService.getGastosByCobradorId(cobradorId);
      res.status(200).json(gastos);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getGastosByFinanciamientoId: async (req, res) => {
    try {
      const financiamientoId = req.params.financiamientoId;
      const gastos = await gastoService.getGastosByFinanciamientoId(financiamientoId);
      res.status(200).json(gastos);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getGastosByTipo: async (req, res) => {
    try {
      const tipoGasto = req.params.tipoGasto;
      const gastos = await gastoService.getGastosByTipo(tipoGasto);
      res.status(200).json(gastos);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getGastosByFechaRango: async (req, res) => {
    try {
      const { fechaInicio, fechaFin } = req.query;
      if (!fechaInicio || !fechaFin) {
        return res.status(400).json({ message: 'fechaInicio and fechaFin are required' });
      }
      const gastos = await gastoService.getGastosByFechaRango(fechaInicio, fechaFin);
      res.status(200).json(gastos);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  filterGastos: async (req, res) => {
    try {
      const filters = req.query;
      const gastos = await gastoService.filterGastos(filters);
      res.status(200).json(gastos);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};