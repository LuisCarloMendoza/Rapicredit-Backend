import { tasaRepository } from '../repositories/tasa.repository.js';

export const tasaService = {
  _validateCreateData: (data) => {
    const required = ['codigoTasa', 'nombre', 'porcentajeInteres'];
    const missing = [];
    for (const key of required) {
      if (data[key] === undefined || data[key] === null) missing.push(key);
    }
    if (missing.length) throw new Error(`Missing required fields: ${missing.join(', ')}`);

    if (typeof data.porcentajeInteres !== 'number') throw new Error('porcentajeInteres must be a number');
    if (data.porcentajeDesembolso !== undefined && typeof data.porcentajeDesembolso !== 'number') throw new Error('porcentajeDesembolso must be a number');
    if (data.capitalMin !== undefined && typeof data.capitalMin !== 'number') throw new Error('capitalMin must be a number');
    if (data.capitalMax !== undefined && typeof data.capitalMax !== 'number') throw new Error('capitalMax must be a number');
    if (data.diasAntesMora !== undefined && typeof data.diasAntesMora !== 'number') throw new Error('diasAntesMora must be a number');
    if (data.requiereSolicitud !== undefined && typeof data.requiereSolicitud !== 'boolean') throw new Error('requiereSolicitud must be a boolean');
    if (data.activa !== undefined && typeof data.activa !== 'boolean') throw new Error('activa must be a boolean');
  },

  _validateUpdateData: (updateData) => {
    if (!updateData || typeof updateData !== 'object') throw new Error('Invalid update payload');
    if (Object.prototype.hasOwnProperty.call(updateData, 'nombre')) throw new Error('nombre cannot be updated');

    if (updateData.porcentajeInteres !== undefined && typeof updateData.porcentajeInteres !== 'number') throw new Error('porcentajeInteres must be a number');
    if (updateData.porcentajeDesembolso !== undefined && typeof updateData.porcentajeDesembolso !== 'number') throw new Error('porcentajeDesembolso must be a number');
    if (updateData.capitalMin !== undefined && typeof updateData.capitalMin !== 'number') throw new Error('capitalMin must be a number');
    if (updateData.capitalMax !== undefined && typeof updateData.capitalMax !== 'number') throw new Error('capitalMax must be a number');
    if (updateData.diasAntesMora !== undefined && typeof updateData.diasAntesMora !== 'number') throw new Error('diasAntesMora must be a number');
    if (updateData.requiereSolicitud !== undefined && typeof updateData.requiereSolicitud !== 'boolean') throw new Error('requiereSolicitud must be a boolean');
    if (updateData.activa !== undefined && typeof updateData.activa !== 'boolean') throw new Error('activa must be a boolean');
  },

  createTasa: async (data) => {
    tasaService._validateCreateData(data);
    const existingByNombre = await tasaRepository.findByNombre(data.nombre);
    if (existingByNombre) throw new Error('A tasa with this nombre already exists.');
    const existingByCodigo = await tasaRepository.findByCodigo(data.codigoTasa);
    if (existingByCodigo) throw new Error('A tasa with this codigoTasa already exists.');
    return await tasaRepository.createTasa(data);
  },

  getByCodigo: async (codigo) => {
    const item = await tasaRepository.findByCodigo(codigo);
    if (!item) throw new Error('Tasa with the provided codigo does not exist.');
    return item;
  },

  updateByCodigo: async (codigo, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'codigoTasa')) delete updateData.codigoTasa;
    tasaService._validateUpdateData(updateData);
    const existing = await tasaRepository.findByCodigo(codigo);
    if (!existing) throw new Error('Tasa with the provided codigo does not exist.');
    return await tasaRepository.updateByCodigo(codigo, updateData);
  },

  updateByNombre: async (nombre, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'nombre')) delete updateData.nombre;
    tasaService._validateUpdateData(updateData);
    const existing = await tasaRepository.findByNombre(nombre);
    if (!existing) throw new Error('Tasa with the provided nombre does not exist.');
    return await tasaRepository.updateByNombre(nombre, updateData);
  },

  updateById: async (id, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'nombre')) delete updateData.nombre;
    tasaService._validateUpdateData(updateData);
    const existing = await tasaRepository.findById(id);
    if (!existing) throw new Error('Tasa with the provided id does not exist.');
    return await tasaRepository.updateById(id, updateData);
  },

  getAll: async () => {
    return await tasaRepository.findAll();
  },

  getByNombre: async (nombre) => {
    const item = await tasaRepository.findByNombre(nombre);
    if (!item) throw new Error('Tasa with the provided nombre does not exist.');
    return item;
  },

  getById: async (id) => {
    const item = await tasaRepository.findById(id);
    if (!item) throw new Error('Tasa with the provided id does not exist.');
    return item;
  },

  deleteByCodigo: async (codigoTasa) => {
    if (!codigoTasa) throw new Error('codigoTasa is required for deleting tasa');
    const existing = await tasaRepository.findByCodigo(codigoTasa);
    if (!existing) throw new Error('Tasa with the provided codigoTasa does not exist.');
    return await tasaRepository.deleteByCodigo(codigoTasa);
  }
};
