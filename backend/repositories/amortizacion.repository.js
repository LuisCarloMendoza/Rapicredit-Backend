import Amortizacion from "../models/amortizacion.model.js";

export const amortizacionRepository = {
  create: async (data) => {
    const entity = new Amortizacion(data);
    return await entity.save();
  },

  findById: async (id) => {
    return await Amortizacion.findById(id);
  },

  findByFinanciamientoId: async (financiamientoId) => {
    return await Amortizacion.find({ financiamientoId }).sort({ orden: 1, fecha: 1 });
  },

  updateById: async (id, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'financiamientoId')) {
      delete updateData.financiamientoId;
    }
    return await Amortizacion.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  },

  deleteById: async (id) => {
    return await Amortizacion.findByIdAndDelete(id);
  }
};
