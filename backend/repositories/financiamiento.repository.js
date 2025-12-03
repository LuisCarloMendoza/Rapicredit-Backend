import Financiamiento from "../models/financiamiento.model.js";

export const financiamientoRepository = {
  createFinanciamiento: async (data) => {
    const entity = new Financiamiento(data);
    return await entity.save();
  },

  findByCodigoFinanciamiento: async (codigoFinanciamiento) => {
    return await Financiamiento.findOne({ codigoFinanciamiento, activo: true });
  },

  findById: async (id) => {
    return await Financiamiento.findOne({ _id: id, activo: true });
  },

  findAllFinanciamientos: async () => {
    return await Financiamiento.find({ activo: true });
  },

  updateFinanciamientoByCodigo: async (codigoFinanciamiento, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'codigoFinanciamiento')) {
      delete updateData.codigoFinanciamiento;
    }
    return await Financiamiento.findOneAndUpdate({ codigoFinanciamiento }, updateData, { new: true, runValidators: true });
  },

  updateById: async (id, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'codigoFinanciamiento')) {
      delete updateData.codigoFinanciamiento;
    }
    return await Financiamiento.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  },

  deleteByCodigoFinanciamiento: async (codigoFinanciamiento) => {
    return await Financiamiento.findOneAndUpdate(
      { codigoFinanciamiento },
      { activo: false },
      { new: true }
    );
  }
};
