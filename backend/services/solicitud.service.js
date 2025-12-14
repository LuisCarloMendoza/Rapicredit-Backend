import Solicitud from '../models/solicitud.model.js';
import Cliente from '../models/cliente.model.js';
import TasaInteres from "../models/tasa.model.js";
import Prestamo from "../models/prestamo.model.js";
import Amortizacion from "../models/amortizacion.model.js";
import mongoose from 'mongoose';

import { nextCodigoPrestamo } from "../utils/codigos.js";
import { buildAmortizacion } from "../utils/amortizacion.js";

const FRECUENCIA_MAP = {
  "Días": "DIARIA",
  "Dias": "DIARIA",
  "DIAS": "DIARIA",
  "Semanas": "SEMANAL",
  "Quincenas": "QUINCENAL",
  "Meses": "MENSUAL",
};

function normalizeFrecuenciaPago(value) {
  if (!value) return null;
  if (FRECUENCIA_MAP[value]) return FRECUENCIA_MAP[value];

  const canon = String(value).toUpperCase();
  if (["DIARIA", "SEMANAL", "QUINCENAL", "MENSUAL"].includes(canon)) return canon;

  throw new Error(`frecuenciaPago inválida: ${value}`);
}

function normalizeAnnualRate(porcentajeInteres) {
  const n = Number(porcentajeInteres || 0);
  if (Number.isNaN(n) || n < 0) throw new Error("Tasa inválida");
  return n > 1 ? n / 100 : n;
}

export const solicitudService = {

  createSolicitud: async (solicitudData) => {
    try {
      const {
        codigoSolicitud,
        clienteId,  // El ID del cliente
        vendedorId,
        capitalSolicitado,
        tasInteresId,
        frecuenciaPago,
        plazoCuotas,
        finalidadCredito,
        usuarioCreacionId
      } = solicitudData;

      // Validación de campos requeridos
      const requiredFields = [
        "codigoSolicitud", "clienteId", "vendedorId",
        "capitalSolicitado", "tasInteresId", "frecuenciaPago",
        "plazoCuotas", "finalidadCredito", "usuarioCreacionId"
      ];

      const missingFields = requiredFields.filter(field => !solicitudData[field]);

      if (missingFields.length) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Convierte el clienteId a un ObjectId válido
      const clienteIdObjectId = new mongoose.Types.ObjectId(clienteId);

      // Verificar que el cliente existe usando el ObjectId
      const cliente = await Cliente.findById(clienteIdObjectId);
      if (!cliente) {
        throw new Error(`Cliente with id ${clienteId} does not exist`);
      }

      // Verificar que la tasa de interés existe
      const tasaInteres = await TasaInteres.findById(tasInteresId);
      if (!tasaInteres) {
        throw new Error(`Tasa de interés with id ${tasInteresId} does not exist`);
      }

      // Crear solicitud
      const solicitud = new Solicitud(solicitudData);
      await solicitud.save();
      return solicitud;

    } catch (error) {
      if (error.code === 11000) {
        throw new Error(`Solicitud with codigoSolicitud ${solicitudData.codigoSolicitud} already exists`);
      }
      throw error;
    }
  },

  getSolicitudByCodigo: async (codigoSolicitud) => {
    try {
      const solicitud = await Solicitud.findOne({ codigoSolicitud, activo: true })
        .populate('clienteId')
        .populate('vendedorId')
        .populate('tasInteresId')
        .populate('frecuenciaPago')
        .populate('usuarioCreacionId')
        .populate('usuarioDecisionId');

      if (!solicitud) {
        throw new Error(`Solicitud with codigoSolicitud ${codigoSolicitud} does not exist`);
      }
      return solicitud;
    } catch (error) {
      throw error;
    }
  },

  getAllSolicitudes: async () => {
    try {
      const solicitudes = await Solicitud.find({ activo: true })
        .populate('clienteId')
        .populate('vendedorId')
        .populate('tasInteresId')
        .populate('frecuenciaPago')
        .populate('usuarioCreacionId')
        .populate('usuarioDecisionId');

      return solicitudes;
    } catch (error) {
      throw error;
    }
  },

  updateSolicitudByCodigo: async (codigoSolicitud, updateData) => {
    try {
      // No permitir cambiar codigoSolicitud (immutable)
      delete updateData.codigoSolicitud;

      const solicitud = await Solicitud.findOneAndUpdate(
        { codigoSolicitud, activo: true },
        updateData,
        { new: true, runValidators: true }
      );

      if (!solicitud) {
        throw new Error(`Solicitud with codigoSolicitud ${codigoSolicitud} does not exist`);
      }
      return solicitud;
    } catch (error) {
      throw error;
    }
  },

  deleteSolicitudByCodigo: async (codigoSolicitud) => {
    try {
      const solicitud = await Solicitud.findOneAndUpdate(
        { codigoSolicitud, activo: true },
        { activo: false },
        { new: true }
      );

      if (!solicitud) {
        throw new Error(`Solicitud with codigoSolicitud ${codigoSolicitud} does not exist`);
      }
      return { message: 'Solicitud disabled successfully' };
    } catch (error) {
      throw error;
    }
  },

  getSolicitudesByCliente: async (clienteId) => {
    try {
      const solicitudes = await Solicitud.find({ clienteId, activo: true })
        .populate('clienteId')
        .populate('vendedorId')
        .populate('tasInteresId')
        .populate('frecuenciaPago')
        .populate('usuarioCreacionId')
        .populate('usuarioDecisionId');

      return solicitudes;
    } catch (error) {
      throw error;
    }
  },

  getSolicitudesByVendedor: async (vendedorId) => {
    try {
      const solicitudes = await Solicitud.find({ vendedorId, activo: true })
        .populate('clienteId')
        .populate('vendedorId')
        .populate('tasInteresId')
        .populate('frecuenciaPago')
        .populate('usuarioCreacionId')
        .populate('usuarioDecisionId');

      return solicitudes;
    } catch (error) {
      throw error;
    }
  },

  getSolicitudesByEstado: async (estadoSolicitud) => {
    try {
      if (!['REGISTRADA', 'EN_REVISION', 'APROBADA', 'RECHAZADA'].includes(estadoSolicitud)) {
        throw new Error('Invalid estado value');
      }

      const solicitudes = await Solicitud.find({ estadoSolicitud, activo: true })
        .populate('clienteId')
        .populate('vendedorId')
        .populate('tasInteresId')
        .populate('frecuenciaPago')
        .populate('usuarioCreacionId')
        .populate('usuarioDecisionId');

      return solicitudes;
    } catch (error) {
      throw error;
    }
  },

  changeSolicitudStatus: async (codigoSolicitud, statusData) => {
    try {
      const { estadoSolicitud, usuarioDecisionId, observaciones } = statusData;

      if (!['REGISTRADA', 'EN_REVISION', 'APROBADA', 'RECHAZADA'].includes(estadoSolicitud)) {
        throw new Error('Invalid estado value');
      }

      const solicitud = await Solicitud.findOneAndUpdate(
        { codigoSolicitud, activo: true },
        { estadoSolicitud, usuarioDecisionId, observaciones },
        { new: true, runValidators: true }
      );

      if (!solicitud) {
        throw new Error(`Solicitud with codigoSolicitud ${codigoSolicitud} does not exist`);
      }
      return solicitud;
    } catch (error) {
      throw error;
    }
  },

  filterSolicitudes: async (filters) => {
    try {
      const query = {};

      if (filters.clienteId) query.clienteId = filters.clienteId;
      if (filters.vendedorId) query.vendedorId = filters.vendedorId;
      if (filters.estadoSolicitud) query.estadoSolicitud = filters.estadoSolicitud;
      if (filters.finalidadCredito) query.finalidadCredito = new RegExp(filters.finalidadCredito, 'i');

      if (filters.capitalMin || filters.capitalMax) {
        query.capitalSolicitado = {};
        if (filters.capitalMin) query.capitalSolicitado.$gte = filters.capitalMin;
        if (filters.capitalMax) query.capitalSolicitado.$lte = filters.capitalMax;
      }

      if (filters.fechaInicio || filters.fechaFin) {
        query.fechaSolicitud = {};
        if (filters.fechaInicio) query.fechaSolicitud.$gte = new Date(filters.fechaInicio);
        if (filters.fechaFin) query.fechaSolicitud.$lte = new Date(filters.fechaFin);
      }

      const solicitudes = await Solicitud.find({ ...query, activo: true })
        .populate('clienteId')
        .populate('vendedorId')
        .populate('tasInteresId')
        .populate('frecuenciaPago')
        .populate('usuarioCreacionId')
        .populate('usuarioDecisionId')
        .sort({ fechaSolicitud: -1 });

      return solicitudes;
    } catch (error) {
      throw error;
    }
  },

  // Aprobar solicitud: crea el préstamo y genera la amortización
  async aprobarSolicitud({ solicitudId, usuarioDecisionId }) {
    const sol = await Solicitud.findById(solicitudId).exec();
    if (!sol) throw new Error("Solicitud no encontrada");

    const allowed = ["REGISTRADA", "EN_REVISION"];
    if (!allowed.includes(sol.estadoSolicitud)) {
      throw new Error(`No se puede aprobar una solicitud en estado ${sol.estadoSolicitud}`);
    }

    const capital = sol.capitalAprobado ?? sol.capitalSolicitado;
    const plazo = sol.plazoCuotasAprobado ?? sol.plazoCuotas;

    const tasaId = sol.tasaInteresIdAprobada ?? sol.tasaInteresId;
    if (!tasaId) throw new Error("La solicitud no tiene tasaInteresId (ni aprobada ni solicitada)");

    const freqRaw = sol.frecuenciaPagoAprobada ?? sol.frecuenciaPago;
    const freqCanon = normalizeFrecuenciaPago(freqRaw);

    const tasa = await TasaInteres.findById(tasaId).exec();
    if (!tasa || tasa.activa === false) throw new Error("Tasa de interés inválida o inactiva");

    const annualRate = normalizeAnnualRate(tasa.porcentajeInteres);

    const codigoPrestamo = await nextCodigoPrestamo();

    const fechaDesembolso = new Date();
    const { cuota, items } = buildAmortizacion({
      principal: Number(capital),
      annualRate,
      nCuotas: Number(plazo),
      freqCanon,
      startDate: fechaDesembolso,
    });

    const fechaVencimiento = items[items.length - 1]?.fechaProgramada ?? fechaDesembolso;

    const prestamo = await Prestamo.create({
      codigoPrestamo,
      solicitudId: sol._id,
      clienteId: sol.clienteId,
      cobradorAsignadoId: null,
      capitalInicial: Number(capital),
      saldoCapital: Number(capital),
      tasaInteresId: tasaId,
      frecuenciaPago: freqCanon,
      cuota: Number(cuota),
      fechaDesembolso,
      fechaVencimiento,
      estadoPrestamo: "VIGENTE",
      observaciones: sol.observaciones || "",
      activo: true,
    });

    const amortDocs = items.map((it) => ({
      prestamoId: prestamo._id,
      numeroCuota: it.numeroCuota,
      fechaProgramada: it.fechaProgramada,
      capital: it.capital,
      interes: it.interes,
      mora: 0,
      saldoCapital: it.saldoCapital,
      estadoCuota: "PENDIENTE",
      pagado: false,
      capitalPagado: 0,
      interesPagado: 0,
      moraPagada: 0,
      activo: true,
    }));

    try {
      await Amortizacion.insertMany(amortDocs, { ordered: true });
    } catch (e) {
      await Prestamo.findByIdAndDelete(prestamo._id).exec();
      throw new Error("No se pudo crear la amortización. Préstamo revertido.");
    }

    sol.estadoSolicitud = "APROBADA";
    sol.usuarioDecisionId = usuarioDecisionId || null;
    sol.prestamoId = prestamo._id;
    sol.amortizacionPreview = items.map((x) => ({
      numeroCuota: x.numeroCuota,
      fechaProgramada: x.fechaProgramada,
      cuota: x.cuota,
      capital: x.capital,
      interes: x.interes,
      mora: 0,
      saldoCapital: x.saldoCapital,
      estadoCuota: "PENDIENTE",
    }));

    await sol.save();

    return {
      prestamoId: prestamo._id.toString(),
      codigoPrestamo: prestamo.codigoPrestamo,
      cuota: prestamo.cuota,
    };
  },
};
