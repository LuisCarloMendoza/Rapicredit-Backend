import Abono from '../models/abono.model.js';

export const abonoRepository = {
  createAbono: async (data) => {
    const entity = new Abono(data);
    return await entity.save();
  },

  findById: async (id) => {
    return await Abono.findById(id);
  },

  findByCodigoAbono: async (codigoAbono) => {
    return await Abono.findOne({ codigoAbono });
  },

  findByFinanciamientoId: async (financiamientoId) => {
    return await Abono.find({ financiamientoId }).sort({ fechaAbono: -1 });
  },

  findByClienteId: async (clienteId) => {
    return await Abono.find({ clienteId }).sort({ fechaAbono: -1 });
  },

  findAllAbonos: async () => {
    return await Abono.find();
  },

  updateById: async (id, updateData) => {
    return await Abono.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  },

  updateByCodigoAbono: async (codigoAbono, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'codigoAbono')) delete updateData.codigoAbono;
    return await Abono.findOneAndUpdate({ codigoAbono }, updateData, { new: true, runValidators: true });
  },

  deleteById: async (id) => {
    return await Abono.findByIdAndDelete(id);
  }
};
