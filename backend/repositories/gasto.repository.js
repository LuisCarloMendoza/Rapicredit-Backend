import Gasto from "../models/gasto.model.js";

export const gastoRepository = {
  createGasto: async (gastoData) => {
    const newGasto = new Gasto(gastoData);
    return await newGasto.save();
  },

  findByCodigoGasto: async (codigoGasto) => {
    return await Gasto.findOne({ codigoGasto });
  },

  findById: async (id) => {
    return await Gasto.findById(id);
  },

  findAllGastos: async () => {
    return await Gasto.find().sort({ fechaGasto: -1 });
  },

  updateGastoByCodigoGasto: async (codigoGasto, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'codigoGasto')) {
      delete updateData.codigoGasto;
    }
    return await Gasto.findOneAndUpdate(
      { codigoGasto },
      updateData,
      { new: true, runValidators: true }
    );
  },

  updateGastoById: async (id, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'codigoGasto')) {
      delete updateData.codigoGasto;
    }
    return await Gasto.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  },

  deleteGastoByCodigoGasto: async (codigoGasto) => {
    return await Gasto.findOneAndDelete({ codigoGasto });
  },

  deleteGastoById: async (id) => {
    return await Gasto.findByIdAndDelete(id);
  },

  findGastosByCobradorId: async (codigoCobradorId) => {
    return await Gasto.find({ codigoCobradorId }).sort({ fechaGasto: -1 });
  },

  findGastosByFinanciamientoId: async (codigoFinanciamiento) => {
    return await Gasto.find({ codigoFinanciamiento }).sort({ fechaGasto: -1 });
  },

  findGastosByTipo: async (tipoGasto) => {
    return await Gasto.find({ tipoGasto }).sort({ fechaGasto: -1 });
  },

  findGastosByFechaRango: async (fechaInicio, fechaFin) => {
    return await Gasto.find({
      fechaGasto: {
        $gte: new Date(fechaInicio),
        $lte: new Date(fechaFin)
      }
    }).sort({ fechaGasto: -1 });
  }
};