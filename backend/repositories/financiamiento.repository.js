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

  findAllFinanciamientos: async (filtros = {}) => {
    const { estado, ordenarPor } = filtros;

    const query = { activo: true };

    // Filtro por estado (ej: VIGENTE, EN_MORA, PAGADO)
    if (estado && estado !== 'TODOS') {
      query.estadoFinanciamiento = estado;
    }

    let mongoQuery = Financiamiento.find(query)
      // Cliente: solo lo básico que suele usarse en listados
      .populate('clienteId', 'codigoCliente identidadCliente RTN')
      // Cobrador asignado (oficial)
      .populate('cobradorAsignadoId', 'nombreCompleto codigoUsuario')
      // Para futuro: usar finalidadCredito como "producto"
      .populate('solicitudId', 'finalidadCredito')
      .lean();

    // Ordenamiento
    switch (ordenarPor) {
      case 'MONTO_MAYOR':
        mongoQuery = mongoQuery.sort({ capitalInicial: -1 });
        break;
      case 'MONTO_MENOR':
        mongoQuery = mongoQuery.sort({ capitalInicial: 1 });
        break;
      case 'MAS_RECIENTES':
        mongoQuery = mongoQuery.sort({ createdAt: -1 });
        break;
      case 'MAYOR_ATRASO':
        // Aproximación: el que vence antes primero
        mongoQuery = mongoQuery.sort({ fechaVencimiento: 1 });
        break;
      default:
        // Por defecto: más recientes primero
        mongoQuery = mongoQuery.sort({ createdAt: -1 });
    }

    const lista = await mongoQuery;

    // Filtro por búsqueda de cliente/código/DNI
    if (filtros.busqueda) {
      const term = filtros.busqueda.trim().toLowerCase();

      return lista.filter((f) => {
        const c = f.clienteId || {};
        const codigoCliente = (c.codigoCliente || '').toLowerCase();
        const identidad = (c.identidadCliente || '').toLowerCase();
        const rtn = (c.RTN || '').toLowerCase();
        const codFin = (f.codigoFinanciamiento || '').toLowerCase();

        return (
          codigoCliente.includes(term) ||
          identidad.includes(term) ||
          rtn.includes(term) ||
          codFin.includes(term)
        );
      });
    }

    return lista;
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

  // ==== NUEVOS MÉTODOS PARA DASHBOARD ====

  countByEstado: async (estado) => {
    const filter = { activo: true };
    if (estado) {
      filter.estadoFinanciamiento = estado;
    }
    return await Financiamiento.countDocuments(filter);
  },

  sumCapitalInicialActivos: async () => {
    const res = await Financiamiento.aggregate([
      { $match: { activo: true } },
      { $group: { _id: null, total: { $sum: '$capitalInicial' } } }
    ]);
    return res.length ? res[0].total : 0;
  },

  countVencenEntre: async (desde, hasta) => {
    const filter = { activo: true };
    if (desde || hasta) {
      filter.fechaVencimiento = {};
      if (desde) filter.fechaVencimiento.$gte = desde;
      if (hasta) filter.fechaVencimiento.$lte = hasta;
    }
    return await Financiamiento.countDocuments(filter);
  },

  findRecientes: async (limit = 10) => {
    return await Financiamiento.find({ activo: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('clienteId', 'codigoCliente identidadCliente') // Ajusta campos si quieres más info
      .lean();
  },

  // ==== NUEVO MÉTODO: obtener financiamientos por una lista de clientes ====
  findByClienteIds: async (clienteIds = []) => {
    if (!clienteIds || clienteIds.length === 0) return [];

    return await Financiamiento.find({
      activo: true,
      clienteId: { $in: clienteIds },
    })
      .lean();
  },

  // ==== NUEVO: actualizar financiamiento por ID ====
  updateFinanciamientoById: async (id, data) => {
    return await Financiamiento.findByIdAndUpdate(id, data, {
      new: true,
    });
  },

  // ==== REPORTES: CARTERA ACTUAL AGRUPADA POR ESTADO Y PRODUCTO ====
  getCarteraActualAgrupada: async () => {
    // Asumimos que 'activo: true' define la cartera vigente
    const pipeline = [
      { $match: { activo: true } },
      {
        $lookup: {
          from: "solicitudes",               // nombre de la colección de solicitudes
          localField: "solicitudId",
          foreignField: "_id",
          as: "solicitud",
        },
      },
      { $unwind: { path: "$solicitud", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            estado: "$estadoFinanciamiento",
            producto: "$solicitud.finalidadCredito",
          },
          totalPrestamos: { $sum: 1 },
          montoTotal: { $sum: "$capitalInicial" },
          saldoTotal: { $sum: "$saldoCapital" },
        },
      },
      {
        $project: {
          _id: 0,
          estado: "$_id.estado",
          producto: "$_id.producto",
          totalPrestamos: 1,
          montoTotal: 1,
          saldoTotal: 1,
        },
      },
    ];

    return await Financiamiento.aggregate(pipeline);
  },

  // ==== REPORTES: MORA (PRÉSTAMOS EN MORA CON DETALLE BÁSICO) ====
  getFinanciamientosEnMoraDesdeDias: async (dias = 30) => {
    const hoy = new Date();
    const limite = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - dias);

    return await Financiamiento.find({
      activo: true,
      estadoFinanciamiento: "EN_MORA",
      fechaVencimiento: { $lte: limite },
    })
      .populate("clienteId", "codigoCliente identidadCliente")
      .lean();
  },

  // ==== REPORTES: COLOCACIÓN MENSUAL (CANTIDAD Y MONTO POR MES) ====
  getColocacionPorMes: async (desde, hasta) => {
    const match = { activo: true };

    if (desde || hasta) {
      match.fechaDesembolso = {};
      if (desde) match.fechaDesembolso.$gte = desde;
      if (hasta) match.fechaDesembolso.$lte = hasta;
    }

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: "$fechaDesembolso" },
            month: { $month: "$fechaDesembolso" },
          },
          cantidadPrestamos: { $sum: 1 },
          montoTotal: { $sum: "$capitalInicial" },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          cantidadPrestamos: 1,
          montoTotal: 1,
        },
      },
      { $sort: { year: 1, month: 1 } },
    ];

    return await Financiamiento.aggregate(pipeline);
  },


  deleteByCodigoFinanciamiento: async (codigoFinanciamiento) => {
    return await Financiamiento.findOneAndUpdate(
      { codigoFinanciamiento },
      { activo: false },
      { new: true }
    );
  }
};
