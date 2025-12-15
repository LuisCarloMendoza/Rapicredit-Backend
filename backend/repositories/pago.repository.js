import Pago from '../models/Pago.model.js';

export const pagoRepository = {
  createPago: async (data) => {
    const entity = new Pago(data);
    return await entity.save();
  },

  findById: async (id) => {
    return await Pago.findOne({ _id: id, activo: true });
  },

  findByCodigoPago: async (codigoPago) => {
    return await Pago.findOne({ codigoPago, activo: true });
  },

  findByFinanciamientoId: async (financiamientoId) => {
    return await Pago.find({ financiamientoId, activo: true }).sort({ fechaPago: -1 });
  },

  findByClienteId: async (clienteId) => {
    return await Pago.find({ clienteId, activo: true }).sort({ fechaPago: -1 });
  },

  findAllPagos: async () => {
    return await Pago.find({ activo: true });
  },

  updateById: async (id, updateData) => {
    return await Pago.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  },

  updateByCodigoPago: async (codigoPago, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'codigoPago')) delete updateData.codigoPago;
    return await Pago.findOneAndUpdate({ codigoPago }, updateData, { new: true, runValidators: true });
  },

  deleteById: async (id) => {
    return await Pago.findByIdAndUpdate(id, { activo: false }, { new: true });
  },

  // ==== NUEVO MÉTODO PARA DASHBOARD (PAGOS DEL DÍA) ====

  findByFechaRango: async (desde, hasta) => {
    const filtro = { activo: true };
    if (desde || hasta) {
      filtro.fechaPago = {};
      if (desde) filtro.fechaPago.$gte = desde;
      if (hasta) filtro.fechaPago.$lte = hasta;
    }

    return await Pago.find(filtro)
      .sort({ fechaPago: -1 })
      .populate('financiamientoId', 'codigoFinanciamiento')
      .populate('clienteId', 'codigoCliente identidadCliente')
      .lean();
  },

  // ==== NUEVO MÉTODO: pagos por lista de clientes, ordenados por fecha desc ====
  findByClienteIds: async (clienteIds = []) => {
    if (!clienteIds || clienteIds.length === 0) return [];

    return await Pago.find({
      activo: true,
      clienteId: { $in: clienteIds },
    })
      .sort({ fechaPago: -1 }) // primero los más recientes
      .lean();
  },


  deleteByCodigoPago: async (codigoPago) => {
    return await Pago.findOneAndUpdate(
      { codigoPago },
      { activo: false },
      { new: true }
    );
  }
};
