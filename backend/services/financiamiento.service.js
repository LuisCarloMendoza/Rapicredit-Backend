import { financiamientoRepository } from "../repositories/financiamiento.repository.js";

export const financiamientoService = {
  _isValidDate: (d) => {
    if (d === null || d === undefined || d === '') return false;
    const date = new Date(d);
    return !Number.isNaN(date.getTime());
  },

  _validateCreateData: (data) => {
    const required = ['codigoFinanciamiento', 'clienteId', 'capitalInicial', 'saldoCapital', 'cuota', 'fechaDesembolso', 'fechaVencimiento', 'estadoFinanciamiento'];
    const missing = [];
    for (const key of required) {
      if (data[key] === undefined || data[key] === null) missing.push(key);
    }
    if (missing.length) throw new Error(`Missing required fields: ${missing.join(', ')}`);

    if (typeof data.capitalInicial !== 'number') throw new Error('capitalInicial must be a number');
    if (typeof data.saldoCapital !== 'number') throw new Error('saldoCapital must be a number');
    if (typeof data.cuota !== 'number') throw new Error('cuota must be a number');
    if (!financiamientoService._isValidDate(data.fechaDesembolso)) throw new Error('fechaDesembolso must be a valid date');
    if (!financiamientoService._isValidDate(data.fechaVencimiento)) throw new Error('fechaVencimiento must be a valid date');
    if (typeof data.estadoFinanciamiento !== 'string') throw new Error('estadoFinanciamiento must be a string');
  },

  _validateUpdateData: (updateData) => {
    if (!updateData || typeof updateData !== 'object') throw new Error('Invalid update payload');
    if (Object.prototype.hasOwnProperty.call(updateData, 'codigoFinanciamiento')) throw new Error('codigoFinanciamiento cannot be updated');

    if (updateData.capitalInicial !== undefined && typeof updateData.capitalInicial !== 'number') throw new Error('capitalInicial must be a number');
    if (updateData.saldoCapital !== undefined && typeof updateData.saldoCapital !== 'number') throw new Error('saldoCapital must be a number');
    if (updateData.cuota !== undefined && typeof updateData.cuota !== 'number') throw new Error('cuota must be a number');
    if (updateData.fechaDesembolso !== undefined && !financiamientoService._isValidDate(updateData.fechaDesembolso)) throw new Error('fechaDesembolso must be a valid date');
    if (updateData.fechaVencimiento !== undefined && !financiamientoService._isValidDate(updateData.fechaVencimiento)) throw new Error('fechaVencimiento must be a valid date');
  },

  createFinanciamiento: async (data) => {
    financiamientoService._validateCreateData(data);
    const existing = await financiamientoRepository.findByCodigoFinanciamiento(data.codigoFinanciamiento);
    if (existing) throw new Error('A financiamiento with this codigoFinanciamiento already exists.');

    // tablaAmortizacion is now a separate collection -- create/validate amortizacion entries using amortizacion service

    return await financiamientoRepository.createFinanciamiento(data);
  },

  updateFinanciamientoByCodigo: async (codigoFinanciamiento, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'codigoFinanciamiento')) {
      delete updateData.codigoFinanciamiento;
    }
    financiamientoService._validateUpdateData(updateData);
    const existing = await financiamientoRepository.findByCodigoFinanciamiento(codigoFinanciamiento);
    if (!existing) throw new Error('Financiamiento with the provided codigoFinanciamiento does not exist.');
    const updated = await financiamientoRepository.updateFinanciamientoByCodigo(codigoFinanciamiento, updateData);
    return updated;
  },

    getAllFinanciamientos: async (filtros) => {
    return await financiamientoRepository.findAllFinanciamientos(filtros);
  },


  getFinanciamientoByCodigo: async (codigoFinanciamiento) => {
    const item = await financiamientoRepository.findByCodigoFinanciamiento(codigoFinanciamiento);
    if (!item) throw new Error('Financiamiento with the provided codigoFinanciamiento does not exist.');
    return item;
  },

  getFinanciamientoById: async (id) => {
    const item = await financiamientoRepository.findById(id);
    if (!item) throw new Error('Financiamiento with the provided id does not exist.');
    return item;
  },

  deleteFinanciamientoByCodigo: async (codigoFinanciamiento) => {
    if (!codigoFinanciamiento) throw new Error('codigoFinanciamiento is required for deleting financiamiento.');
    const existing = await financiamientoRepository.findByCodigoFinanciamiento(codigoFinanciamiento);
    if (!existing) throw new Error('Financiamiento with the provided codigoFinanciamiento does not exist.');
    return await financiamientoRepository.deleteByCodigoFinanciamiento(codigoFinanciamiento);
  }
};
