import { gastoRepository } from '../repositories/gasto.repository.js';

export const gastoService = {
  _isValidDate: (d) => {
    if (d === null || d === undefined || d === '') return false;
    const date = new Date(d);
    return !Number.isNaN(date.getTime());
  },

  _validateCreateData: (data) => {
    const required = ['codigoGasto', 'fechaGasto', 'tipoGasto', 'monto', 'registradoPorId'];
    const missing = [];
    for (const key of required) {
      if (data[key] === undefined || data[key] === null) missing.push(key);
    }
    if (missing.length) throw new Error(`Missing required fields: ${missing.join(', ')}`);

    if (!gastoService._isValidDate(data.fechaGasto)) throw new Error('fechaGasto must be a valid date');
    if (typeof data.monto !== 'number') throw new Error('monto must be a number');
  },

  _validateUpdateData: (updateData) => {
    if (!updateData || typeof updateData !== 'object') throw new Error('Invalid update payload');
    if (updateData.fechaGasto !== undefined && !gastoService._isValidDate(updateData.fechaGasto)) throw new Error('fechaGasto must be a valid date');
    if (updateData.monto !== undefined && typeof updateData.monto !== 'number') throw new Error('monto must be a number');
  },

  createGasto: async (data) => {
    gastoService._validateCreateData(data);
    const existing = await gastoRepository.findByCodigoGasto(data.codigoGasto);
    if (existing) throw new Error('A gasto with this codigoGasto already exists.');
    return await gastoRepository.createGasto(data);
  },

  getById: async (id) => {
    const item = await gastoRepository.findById(id);
    if (!item) throw new Error('Gasto not found');
    return item;
  },

  getByCodigo: async (codigo) => {
    const item = await gastoRepository.findByCodigoGasto(codigo);
    if (!item) throw new Error('Gasto not found');
    return item;
  },

  getByFinanciamientoId: async (financiamientoId) => {
    return await gastoRepository.findByFinanciamientoId(financiamientoId);
  },

  getAll: async () => {
    return await gastoRepository.findAllGastos();
  },

  updateById: async (id, updateData) => {
    gastoService._validateUpdateData(updateData);
    return await gastoRepository.updateById(id, updateData);
  },

  updateByCodigo: async (codigo, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'codigoGasto')) delete updateData.codigoGasto;
    gastoService._validateUpdateData(updateData);
    const existing = await gastoRepository.findByCodigoGasto(codigo);
    if (!existing) throw new Error('Gasto with the provided codigoGasto does not exist.');
    return await gastoRepository.updateByCodigoGasto(codigo, updateData);
  },

  deleteById: async (id) => {
    return await gastoRepository.deleteById(id);
  }
};
