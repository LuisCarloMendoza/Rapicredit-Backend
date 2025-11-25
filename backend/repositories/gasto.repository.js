import Gasto from '../models/gasto.model.js';

export const gastoRepository = {
  createGasto: async (data) => {
    const entity = new Gasto(data);
    return await entity.save();
  },

  findById: async (id) => {
    return await Gasto.findById(id);
  },

  findByCodigoGasto: async (codigoGasto) => {
    return await Gasto.findOne({ codigoGasto });
  },

  findByFinanciamientoId: async (financiamientoId) => {
    return await Gasto.find({ financiamientoId }).sort({ fechaGasto: -1 });
  },

  findAllGastos: async () => {
    return await Gasto.find();
  },

  updateById: async (id, updateData) => {
    return await Gasto.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  },

  updateByCodigoGasto: async (codigoGasto, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'codigoGasto')) delete updateData.codigoGasto;
    return await Gasto.findOneAndUpdate({ codigoGasto }, updateData, { new: true, runValidators: true });
  },

  deleteById: async (id) => {
    return await Gasto.findByIdAndDelete(id);
  }
};
