import { gastoRepository } from "../repositories/gasto.repository.js";
import Gasto from "../models/gasto.model.js";

export const gastoService = {
  _isValidDate: (d) => {
    if (d === null || d === undefined || d === '') return false;
    const date = new Date(d);
    return !Number.isNaN(date.getTime());
  },

  _validateCreateData: (data) => {
    const required = ['codigoGasto', 'fechaGasto', 'tipoGasto', 'monto', 'codigoRegistradoPor'];
    const missing = [];
    for (const key of required) {
      if (data[key] === undefined || data[key] === null) missing.push(key);
    }
    if (missing.length) throw new Error(`Missing required fields: ${missing.join(', ')}`);

    if (!gastoService._isValidDate(data.fechaGasto)) throw new Error('fechaGasto must be a valid date');
    if (typeof data.monto !== 'number' || data.monto < 0) throw new Error('monto must be a positive number');
    if (typeof data.tipoGasto !== 'string' || data.tipoGasto.trim() === '') throw new Error('tipoGasto must be a non-empty string');

    // Validate codigo strings
    if (typeof data.codigoRegistradoPor !== 'string' || data.codigoRegistradoPor.trim() === '') {
      throw new Error('codigoRegistradoPor must be a non-empty string');
    }

    if (data.codigoCobradorId !== undefined && data.codigoCobradorId !== null && String(data.codigoCobradorId) !== '') {
      if (typeof data.codigoCobradorId !== 'string' || data.codigoCobradorId.trim() === '') {
        throw new Error('codigoCobradorId must be a non-empty string');
      }
    }

    if (data.codigoFinanciamiento !== undefined && data.codigoFinanciamiento !== null && String(data.codigoFinanciamiento) !== '') {
      if (typeof data.codigoFinanciamiento !== 'string' || data.codigoFinanciamiento.trim() === '') {
        throw new Error('codigoFinanciamiento must be a non-empty string');
      }
    }
  },

  _validateUpdateData: (updateData) => {
    if (!updateData || typeof updateData !== 'object') throw new Error('Invalid update payload');
    if (Object.prototype.hasOwnProperty.call(updateData, 'codigoGasto')) throw new Error('codigoGasto cannot be updated');

    if (updateData.fechaGasto !== undefined && !gastoService._isValidDate(updateData.fechaGasto)) throw new Error('fechaGasto must be a valid date');
    if (updateData.monto !== undefined && (typeof updateData.monto !== 'number' || updateData.monto < 0)) throw new Error('monto must be a positive number');
    if (updateData.tipoGasto !== undefined && (typeof updateData.tipoGasto !== 'string' || updateData.tipoGasto.trim() === '')) throw new Error('tipoGasto must be a non-empty string');

    // validate codigo fields if present
    if (updateData.codigoRegistradoPor !== undefined && updateData.codigoRegistradoPor !== null) {
      if (typeof updateData.codigoRegistradoPor !== 'string' || updateData.codigoRegistradoPor.trim() === '') {
        throw new Error('codigoRegistradoPor must be a non-empty string');
      }
    }

    if (updateData.codigoCobradorId !== undefined && updateData.codigoCobradorId !== null && String(updateData.codigoCobradorId) !== '') {
      if (typeof updateData.codigoCobradorId !== 'string' || updateData.codigoCobradorId.trim() === '') {
        throw new Error('codigoCobradorId must be a non-empty string');
      }
    }

    if (updateData.codigoFinanciamiento !== undefined && updateData.codigoFinanciamiento !== null && String(updateData.codigoFinanciamiento) !== '') {
      if (typeof updateData.codigoFinanciamiento !== 'string' || updateData.codigoFinanciamiento.trim() === '') {
        throw new Error('codigoFinanciamiento must be a non-empty string');
      }
    }
  },

  createGasto: async (gastoData) => {
    gastoService._validateCreateData(gastoData);
    const existing = await gastoRepository.findByCodigoGasto(gastoData.codigoGasto);
    if (existing) throw new Error('A gasto with this codigoGasto already exists.');
    return await gastoRepository.createGasto(gastoData);
  },

  updateGastoByCodigoGasto: async (codigoGasto, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'codigoGasto')) {
      delete updateData.codigoGasto;
    }
    gastoService._validateUpdateData(updateData);
    const existing = await gastoRepository.findByCodigoGasto(codigoGasto);
    if (!existing) throw new Error('Gasto with the provided codigoGasto does not exist.');
    const updated = await gastoRepository.updateGastoByCodigoGasto(codigoGasto, updateData);
    return updated;
  },

  updateGastoById: async (id, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'codigoGasto')) {
      delete updateData.codigoGasto;
    }
    gastoService._validateUpdateData(updateData);
    const existing = await gastoRepository.findById(id);
    if (!existing) throw new Error('Gasto with the provided id does not exist.');
    const updated = await gastoRepository.updateGastoById(id, updateData);
    return updated;
  },

  deleteGastoByCodigoGasto: async (codigoGasto) => {
    const existing = await gastoRepository.findByCodigoGasto(codigoGasto);
    if (!existing) throw new Error('Gasto with the provided codigoGasto does not exist.');
    await gastoRepository.deleteGastoByCodigoGasto(codigoGasto);
    return { message: 'Gasto deleted successfully' };
  },

  deleteGastoById: async (id) => {
    const existing = await gastoRepository.findById(id);
    if (!existing) throw new Error('Gasto with the provided id does not exist.');
    await gastoRepository.deleteGastoById(id);
    return { message: 'Gasto deleted successfully' };
  },

  getAllGastos: async () => {
    return await gastoRepository.findAllGastos();
  },

  getGastoByCodigoGasto: async (codigoGasto) => {
    const gasto = await gastoRepository.findByCodigoGasto(codigoGasto);
    if (!gasto) throw new Error('Gasto with the provided codigoGasto does not exist.');
    return gasto;
  },

  getGastoById: async (id) => {
    const gasto = await gastoRepository.findById(id);
    if (!gasto) throw new Error('Gasto with the provided id does not exist.');
    return gasto;
  },

  getGastosByCobradorId: async (cobradorId) => {
    return await gastoRepository.findGastosByCobradorId(cobradorId);
  },

  getGastosByFinanciamientoId: async (financiamientoId) => {
    return await gastoRepository.findGastosByFinanciamientoId(financiamientoId);
  },

  getGastosByTipo: async (tipoGasto) => {
    return await gastoRepository.findGastosByTipo(tipoGasto);
  },

  getGastosByFechaRango: async (fechaInicio, fechaFin) => {
    if (!gastoService._isValidDate(fechaInicio) || !gastoService._isValidDate(fechaFin)) {
      throw new Error('Invalid date range');
    }
    return await gastoRepository.findGastosByFechaRango(fechaInicio, fechaFin);
  },

  filterGastos: async (filters) => {
    try {
      const query = {};

      if (filters.codigoCobradorId) query.codigoCobradorId = filters.codigoCobradorId;
      if (filters.codigoFinanciamiento) query.codigoFinanciamiento = filters.codigoFinanciamiento;
      if (filters.tipoGasto) query.tipoGasto = new RegExp(filters.tipoGasto, 'i');
      if (filters.codigoRegistradoPor) query.codigoRegistradoPor = filters.codigoRegistradoPor;

      // Rango de monto
      if (filters.montoMin || filters.montoMax) {
        query.monto = {};
        if (filters.montoMin) query.monto.$gte = filters.montoMin;
        if (filters.montoMax) query.monto.$lte = filters.montoMax;
      }

      // Rango de fechas
      if (filters.fechaInicio || filters.fechaFin) {
        query.fechaGasto = {};
        if (filters.fechaInicio) query.fechaGasto.$gte = new Date(filters.fechaInicio);
        if (filters.fechaFin) query.fechaGasto.$lte = new Date(filters.fechaFin);
      }

      const gastos = await Gasto.find(query).sort({ fechaGasto: -1 });
      return gastos;
    } catch (error) {
      throw error;
    }
  }
};