import { frecuenciaRepository } from '../repositories/frecuencia.repository.js';

export const frecuenciaService = {
  _validateCreateData: (data) => {
    const required = ['codigoFrecuenciaPagos', 'nombre', 'diasEntreCuotas'];
    const missing = [];
    for (const key of required) {
      if (data[key] === undefined || data[key] === null) missing.push(key);
    }
    if (missing.length) throw new Error(`Missing required fields: ${missing.join(', ')}`);

    if (typeof data.diasEntreCuotas !== 'number') throw new Error('diasEntreCuotas must be a number');
    if (data.activa !== undefined && typeof data.activa !== 'boolean') throw new Error('activa must be a boolean');
  },

  _validateUpdateData: (updateData) => {
    if (!updateData || typeof updateData !== 'object') throw new Error('Invalid update payload');
    if (Object.prototype.hasOwnProperty.call(updateData, 'codigoFrecuenciaPagos')) throw new Error('codigoFrecuenciaPagos cannot be updated');

    if (updateData.diasEntreCuotas !== undefined && typeof updateData.diasEntreCuotas !== 'number') throw new Error('diasEntreCuotas must be a number');
    if (updateData.activa !== undefined && typeof updateData.activa !== 'boolean') throw new Error('activa must be a boolean');
  },

  createFrecuencia: async (data) => {
    frecuenciaService._validateCreateData(data);
    const existing = await frecuenciaRepository.findByCodigo(data.codigoFrecuenciaPagos);
    if (existing) throw new Error('A frecuencia with this codigoFrecuenciaPagos already exists.');
    return await frecuenciaRepository.createFrecuencia(data);
  },

  updateByCodigo: async (codigo, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'codigoFrecuenciaPagos')) delete updateData.codigoFrecuenciaPagos;
    frecuenciaService._validateUpdateData(updateData);
    const existing = await frecuenciaRepository.findByCodigo(codigo);
    if (!existing) throw new Error('Frecuencia with the provided codigo does not exist.');
    return await frecuenciaRepository.updateByCodigo(codigo, updateData);
  },

  updateById: async (id, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'codigoFrecuenciaPagos')) delete updateData.codigoFrecuenciaPagos;
    frecuenciaService._validateUpdateData(updateData);
    const existing = await frecuenciaRepository.findById(id);
    if (!existing) throw new Error('Frecuencia with the provided id does not exist.');
    return await frecuenciaRepository.updateById(id, updateData);
  },

  getAll: async () => {
    return await frecuenciaRepository.findAll();
  },

  getByCodigo: async (codigo) => {
    const item = await frecuenciaRepository.findByCodigo(codigo);
    if (!item) throw new Error('Frecuencia with the provided codigo does not exist.');
    return item;
  },

  getById: async (id) => {
    const item = await frecuenciaRepository.findById(id);
    if (!item) throw new Error('Frecuencia with the provided id does not exist.');
    return item;
  }
};
