import Abono from '../models/abono.model.js';

export const abonoRepository = {
  createAbono: async (data) => {
    const entity = new Abono(data);
    return await entity.save();
  },

  findById: async (id) => {
    return await Abono.findOne({ _id: id, activo: true });
  },

  findByCodigoAbono: async (codigoAbono) => {
    return await Abono.findOne({ codigoAbono, activo: true });
  },

  findByFinanciamientoId: async (financiamientoId) => {
    return await Abono.find({ financiamientoId, activo: true }).sort({ fechaAbono: -1 });
  },

  findByClienteId: async (clienteId) => {
    return await Abono.find({ clienteId, activo: true }).sort({ fechaAbono: -1 });
  },

  findAllAbonos: async () => {
    return await Abono.find({ activo: true });
  },

  updateById: async (id, updateData) => {
    return await Abono.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  },

  updateByCodigoAbono: async (codigoAbono, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'codigoAbono')) delete updateData.codigoAbono;
    return await Abono.findOneAndUpdate({ codigoAbono }, updateData, { new: true, runValidators: true });
  },

  deleteById: async (id) => {
    return await Abono.findByIdAndUpdate(id, { activo: false }, { new: true });
  },

  deleteByCodigoAbono: async (codigoAbono) => {
    return await Abono.findOneAndUpdate(
      { codigoAbono },
      { activo: false },
      { new: true }
    );
  }
};
