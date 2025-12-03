import { abonoRepository } from '../repositories/abono.repository.js';

export const abonoService = {
  _isValidDate: (d) => {
    if (d === null || d === undefined || d === '') return false;
    const date = new Date(d);
    return !Number.isNaN(date.getTime());
  },

  _validateCreateData: (data) => {
    const required = ['codigoAbono', 'financiamientoId', 'clienteId', 'cobradorId', 'fechaAbono', 'montoAbono', 'tipoAbono'];
    const missing = [];
    for (const key of required) {
      if (data[key] === undefined || data[key] === null) missing.push(key);
    }
    if (missing.length) throw new Error(`Missing required fields: ${missing.join(', ')}`);

    if (!abonoService._isValidDate(data.fechaAbono)) throw new Error('fechaAbono must be a valid date');
    if (typeof data.montoAbono !== 'number') throw new Error('montoAbono must be a number');
    ['aplicadoAMora', 'aplicadoAInteres', 'aplicadoACapital', 'saldoCapitalDespues'].forEach((k) => {
      if (data[k] !== undefined && typeof data[k] !== 'number') throw new Error(`${k} must be a number`);
    });
    if (data.metodoPago !== undefined && typeof data.metodoPago !== 'string') throw new Error('metodoPago must be a string');
    if (data.tipoAbono !== undefined && typeof data.tipoAbono !== 'string') throw new Error('tipoAbono must be a string');
  },

  _validateUpdateData: (updateData) => {
    if (!updateData || typeof updateData !== 'object') throw new Error('Invalid update payload');

    if (updateData.fechaAbono !== undefined && !abonoService._isValidDate(updateData.fechaAbono)) throw new Error('fechaAbono must be a valid date');
    if (updateData.montoAbono !== undefined && typeof updateData.montoAbono !== 'number') throw new Error('montoAbono must be a number');
    ['aplicadoAMora', 'aplicadoAInteres', 'aplicadoACapital', 'saldoCapitalDespues'].forEach((k) => {
      if (updateData[k] !== undefined && typeof updateData[k] !== 'number') throw new Error(`${k} must be a number`);
    });
  },

  createAbono: async (data) => {
    abonoService._validateCreateData(data);
    // ensure codigoAbono uniqueness
    const existing = await abonoRepository.findByCodigoAbono(data.codigoAbono);
    if (existing) throw new Error('An abono with this codigoAbono already exists.');
    // NOTE: business rules (applying amounts to amortization records, updating financiamiento.saldoCapital, etc.)
    // should be implemented here in the future. Right now we only persist the abono.
    const created = await abonoRepository.createAbono(data);
    return created;
  },

  getByFinanciamientoId: async (financiamientoId) => {
    return await abonoRepository.findByFinanciamientoId(financiamientoId);
  },

  getByClienteId: async (clienteId) => {
    return await abonoRepository.findByClienteId(clienteId);
  },

  getById: async (id) => {
    const item = await abonoRepository.findById(id);
    if (!item) throw new Error('Abono not found');
    return item;
  },

  getByCodigo: async (codigoAbono) => {
    const item = await abonoRepository.findByCodigoAbono(codigoAbono);
    if (!item) throw new Error('Abono not found');
    return item;
  },

  getAll: async () => {
    return await abonoRepository.findAllAbonos();
  },

  updateById: async (id, updateData) => {
    abonoService._validateUpdateData(updateData);
    const updated = await abonoRepository.updateById(id, updateData);
    return updated;
  },

  updateByCodigo: async (codigoAbono, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'codigoAbono')) delete updateData.codigoAbono;
    abonoService._validateUpdateData(updateData);
    const existing = await abonoRepository.findByCodigoAbono(codigoAbono);
    if (!existing) throw new Error('Abono with the provided codigoAbono does not exist.');
    const updated = await abonoRepository.updateByCodigoAbono(codigoAbono, updateData);
    return updated;
  },

  deleteById: async (id) => {
    return await abonoRepository.deleteById(id);
  },

  deleteByCodigo: async (codigoAbono) => {
    if (!codigoAbono) throw new Error('codigoAbono is required for deleting abono');
    const existing = await abonoRepository.findByCodigoAbono(codigoAbono);
    if (!existing) throw new Error('Abono with the provided codigoAbono does not exist.');
    return await abonoRepository.deleteByCodigoAbono(codigoAbono);
  }
};
