import Parametros from "../models/parametros.model.js";

export const parametrosRepository = {
  createParametros: async (data) => {
    const entity = new Parametros(data);
    return await entity.save();
  },

  findByCodigoParametros: async (codigoParametros) => {
    return await Parametros.findOne({ codigoParametros });
  },

  updateParametrosByCodigo: async (codigoParametros, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'codigoParametros')) {
      delete updateData.codigoParametros;
    }
    return await Parametros.findOneAndUpdate({ codigoParametros }, updateData, { new: true, runValidators: true });
  },

  findAllParametros: async () => {
    return await Parametros.find();
  },
};
