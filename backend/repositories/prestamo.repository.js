import Prestamo from "../models/prestamo.model.js";

export const prestamoRepository = {
    // Crear un nuevo préstamo
    async createPrestamo(data) {
        const entity = new Prestamo(data);
        return await entity.save();
    },

    // Buscar préstamo por código
    async findByCodigoPrestamo(codigoPrestamo) {
        return await Prestamo.findOne({ codigoPrestamo, activo: true });
    },

    // Buscar préstamo por ID
    findById: async (id) => {
        return await Prestamo.findOne({ _id: id, activo: true });
    },

    // Buscar todos los préstamos con filtros
    findAllPrestamos: async (filtros = {}) => {
        const { estado, ordenarPor } = filtros;

        const query = { activo: true };

        if (estado && estado !== 'TODOS') {
            query.estadoPrestamo = estado;
        }

        let mongoQuery = Prestamo.find(query)
            .populate('clienteId', 'codigoCliente identidadCliente RTN')
            .populate('tasaInteresId', 'nombre porcentajeInteres')  // Cambié 'solicitudId' a tasaInteresId
            .populate('solicitudId', 'finalidadCredito')
            .lean();

        // Ordenamiento
        switch (ordenarPor) {
            case 'MONTO_MAYOR':
                mongoQuery = mongoQuery.sort({ capitalSolicitado: -1 });
                break;
            case 'MONTO_MENOR':
                mongoQuery = mongoQuery.sort({ capitalSolicitado: 1 });
                break;
            case 'MAS_RECIENTES':
                mongoQuery = mongoQuery.sort({ createdAt: -1 });
                break;
            case "MAYOR_ATRASO":
                // Aproximación: el que vence antes primero
                mongoQuery = mongoQuery.sort({ fechaVencimiento: 1 });
                break;
            default:
                mongoQuery = mongoQuery.sort({ createdAt: -1 });
        }

        const lista = await mongoQuery;

        // Filtrar por búsqueda de cliente/código/DNI
        if (filtros.busqueda) {
            const term = filtros.busqueda.trim().toLowerCase();

            return lista.filter((f) => {
                const c = f.clienteId || {};
                const codigoCliente = (c.codigoCliente || '').toLowerCase();
                const identidad = (c.identidadCliente || '').toLowerCase();
                const rtn = (c.RTN || '').toLowerCase();
                const codPrestamo = (f.codigoPrestamo || '').toLowerCase();

                return (
                    codigoCliente.includes(term) ||
                    identidad.includes(term) ||
                    rtn.includes(term) ||
                    codPrestamo.includes(term)
                );
            });
        }

        return lista;
    },

    // Actualizar préstamo por código
    async updateByCodigoPrestamo(codigoPrestamo, updateData) {
        if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'codigoPrestamo')) {
            delete updateData.codigoPrestamo;
        }
        return await Prestamo.findOneAndUpdate({ codigoPrestamo }, updateData, { new: true, runValidators: true });
    },

    // Eliminar préstamo por código
    async deleteByCodigoPrestamo(codigoPrestamo) {
        return await Prestamo.findOneAndUpdate(
            { codigoPrestamo },
            { activo: false },
            { new: true }
        );
    },

    // ==== Nuevos métodos para Dashboard/Reportes ====

    // Obtener la cantidad de préstamos por estado (similar a "countByEstado" en financiamiento)
    countByEstado: async (estado) => {
        const filter = { activo: true };
        if (estado) {
            filter.estadoPrestamo = estado;
        }
        return await Prestamo.countDocuments(filter);
    },

    // Obtener el total de capital inicial de préstamos activos (similar a "sumCapitalInicialActivos" en financiamiento)
    sumCapitalInicialActivos: async () => {
        const res = await Prestamo.aggregate([
            { $match: { activo: true } },
            { $group: { _id: null, total: { $sum: "$capitalSolicitado" } } },
        ]);
        return res.length ? res[0].total : 0;
    },

    // Obtener préstamos que vencen entre dos fechas (similar a "countVencenEntre" en financiamiento)
    countVencenEntre: async (desde, hasta) => {
        const filter = { activo: true };
        if (desde || hasta) {
            filter.fechaVencimiento = {};
            if (desde) filter.fechaVencimiento.$gte = desde;
            if (hasta) filter.fechaVencimiento.$lte = hasta;
        }
        return await Prestamo.countDocuments(filter);
    },

    // Obtener préstamos recientes (similar a "findRecientes" en financiamiento)
    findRecientes: async (limit = 10) => {
        return await Prestamo.find({ activo: true })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate("clienteId", "codigoCliente identidadCliente") // Ajusta campos si quieres más info
            .lean();
    },

    // Obtener préstamos por una lista de clientes
    findByClienteIds: async (clienteIds = []) => {
        if (!clienteIds || clienteIds.length === 0) return [];

        return await Prestamo.find({
            activo: true,
            clienteId: { $in: clienteIds },
        }).lean();
    },

    // Obtener préstamo por ID (similar a "updateFinanciamientoById" en financiamiento)
    updatePrestamoById: async (id, data) => {
        return await Prestamo.findByIdAndUpdate(id, data, {
            new: true,
        });
    },

    // ===================== Reportes de cartera =====================
    // Métodos de agregación similares a los de Financiamiento

    // Obtener cartera actual agrupada por estado y producto
    getCarteraActualAgrupada: async () => {
        const pipeline = [
            { $match: { activo: true } },
            {
                $lookup: {
                    from: "solicitudes",
                    localField: "solicitudId",
                    foreignField: "_id",
                    as: "solicitud",
                },
            },
            { $unwind: { path: "$solicitud", preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: {
                        estado: "$estadoPrestamo",
                        producto: "$solicitud.finalidadCredito",
                    },
                    totalPrestamos: { $sum: 1 },
                    montoTotal: { $sum: "$capitalSolicitado" },
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

        return await Prestamo.aggregate(pipeline);
    },

    // Obtener préstamos en mora (similar a los "financiamientos en mora")
    getPrestamosEnMoraDesdeDias: async (dias = 30) => {
        const hoy = new Date();
        const limite = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - dias);

        return await Prestamo.find({
            activo: true,
            estadoPrestamo: "MORA",
            fechaVencimiento: { $lte: limite },
        })
            .populate("clienteId", "codigoCliente identidadCliente")
            .lean();
    },

    // Obtener colocación mensual
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
                    montoTotal: { $sum: "$capitalSolicitado" },
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

        return await Prestamo.aggregate(pipeline);
    },
};
