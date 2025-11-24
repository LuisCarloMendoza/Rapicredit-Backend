import { parametrosRepository } from "../repositories/parametros.repository.js";

export const parametrosService = {
  _validateCreateData: (data) => {
    const required = ['codigoParametros', 'nombre', 'porcentajeComision', 'limitePrestamoMin', 'limitePrestamoMax'];
    const missing = [];
    for (const key of required) {
      if (data[key] === undefined || data[key] === null) missing.push(key);
    }
    if (missing.length) throw new Error(`Missing required fields: ${missing.join(', ')}`);

    if (typeof data.porcentajeComision !== 'number') throw new Error('porcentajeComision must be a number');
    if (typeof data.limitePrestamoMin !== 'number') throw new Error('limitePrestamoMin must be a number');
    if (typeof data.limitePrestamoMax !== 'number') throw new Error('limitePrestamoMax must be a number');
    if (data.interesCorrienteBase !== undefined && typeof data.interesCorrienteBase !== 'number') throw new Error('interesCorrienteBase must be a number');
    if (data.interesMoraBase !== undefined && typeof data.interesMoraBase !== 'number') throw new Error('interesMoraBase must be a number');
    if (data.configCAI !== undefined && !Array.isArray(data.configCAI)) throw new Error('configCAI must be an array of strings');
  },

  _validateUpdateData: (updateData) => {
    if (!updateData || typeof updateData !== 'object') throw new Error('Invalid update payload');
    if (Object.prototype.hasOwnProperty.call(updateData, 'codigoParametros')) throw new Error('codigoParametros cannot be updated');

    if (updateData.porcentajeComision !== undefined && typeof updateData.porcentajeComision !== 'number') throw new Error('porcentajeComision must be a number');
    if (updateData.limitePrestamoMin !== undefined && typeof updateData.limitePrestamoMin !== 'number') throw new Error('limitePrestamoMin must be a number');
    if (updateData.limitePrestamoMax !== undefined && typeof updateData.limitePrestamoMax !== 'number') throw new Error('limitePrestamoMax must be a number');
    if (updateData.interesCorrienteBase !== undefined && typeof updateData.interesCorrienteBase !== 'number') throw new Error('interesCorrienteBase must be a number');
    if (updateData.interesMoraBase !== undefined && typeof updateData.interesMoraBase !== 'number') throw new Error('interesMoraBase must be a number');
    if (updateData.configCAI !== undefined && !Array.isArray(updateData.configCAI)) throw new Error('configCAI must be an array of strings');
  },

  createParametros: async (data) => {
    parametrosService._validateCreateData(data);
    const existing = await parametrosRepository.findByCodigoParametros(data.codigoParametros);
    if (existing) throw new Error('A parametros entry with this codigoParametros already exists.');
    return await parametrosRepository.createParametros(data);
  },

  updateParametrosByCodigo: async (codigoParametros, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'codigoParametros')) {
      delete updateData.codigoParametros;
    }
    parametrosService._validateUpdateData(updateData);
    const existing = await parametrosRepository.findByCodigoParametros(codigoParametros);
    if (!existing) throw new Error('Parametros with the provided codigoParametros does not exist.');
    const updated = await parametrosRepository.updateParametrosByCodigo(codigoParametros, updateData);
    return updated;
  },

  getAllParametros: async () => {
    return await parametrosRepository.findAllParametros();
  },

  getParametrosByCodigo: async (codigoParametros) => {
    const item = await parametrosRepository.findByCodigoParametros(codigoParametros);
    if (!item) throw new Error('Parametros with the provided codigoParametros does not exist.');
    return item;
  },
};
