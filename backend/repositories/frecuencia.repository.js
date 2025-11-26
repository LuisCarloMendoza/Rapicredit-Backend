import FrecuenciaPago from '../models/frecuencia.model.js';

export const frecuenciaRepository = {
  createFrecuencia: async (data) => {
    const entity = new FrecuenciaPago(data);
    return await entity.save();
  },

  findByCodigo: async (codigo) => {
    return await FrecuenciaPago.findOne({ codigoFrecuenciaPagos: codigo });
  },

  findById: async (id) => {
    return await FrecuenciaPago.findById(id);
  },

  findAll: async () => {
    return await FrecuenciaPago.find();
  },

  updateByCodigo: async (codigo, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'codigoFrecuenciaPagos')) delete updateData.codigoFrecuenciaPagos;
    return await FrecuenciaPago.findOneAndUpdate({ codigoFrecuenciaPagos: codigo }, updateData, { new: true, runValidators: true });
  },

  updateById: async (id, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'codigoFrecuenciaPagos')) delete updateData.codigoFrecuenciaPagos;
    return await FrecuenciaPago.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }
};