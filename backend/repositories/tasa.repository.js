import TasaInteres from '../models/tasa.model.js';

export const tasaRepository = {
  createTasa: async (data) => {
    const entity = new TasaInteres(data);
    return await entity.save();
  },

  findByNombre: async (nombre) => {
    return await TasaInteres.findOne({ nombre });
  },

  findByCodigo: async (codigoTasa) => {
    return await TasaInteres.findOne({ codigoTasa });
  },

  findById: async (id) => {
    return await TasaInteres.findById(id);
  },

  findAll: async () => {
    return await TasaInteres.find();
  },

  updateByNombre: async (nombre, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'nombre')) {
      delete updateData.nombre;
    }
    return await TasaInteres.findOneAndUpdate({ nombre }, updateData, { new: true, runValidators: true });
  },

  updateByCodigo: async (codigoTasa, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'codigoTasa')) delete updateData.codigoTasa;
    return await TasaInteres.findOneAndUpdate({ codigoTasa }, updateData, { new: true, runValidators: true });
  },

  updateById: async (id, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'nombre')) {
      delete updateData.nombre;
    }
    return await TasaInteres.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }
};
