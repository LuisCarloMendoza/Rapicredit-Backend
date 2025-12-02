import Solicitud from '../models/solicitud.model.js';
import Cliente from '../models/cliente.model.js';
import { amortizacionService } from './amortizacion.service.js';
import mongoose from 'mongoose';

export const solicitudService = {
  createSolicitud: async (solicitudData) => {
    try {
      const { codigoSolicitud, clienteId, vendedorId, capitalSolicitado, tasInteresId, frecuenciaPagoId, plazoCuotas, finalidadCredito, usuarioCreacionId } = solicitudData;

      // Validar campos requeridos
      if (!codigoSolicitud || !clienteId || !vendedorId || !capitalSolicitado || !tasInteresId || !frecuenciaPagoId || !plazoCuotas || !finalidadCredito || !usuarioCreacionId) {
        throw new Error('Missing required fields');
      }

      // Verificar que cliente existe
      const cliente = await Cliente.findById(clienteId);
      if (!cliente) {
        throw new Error(`Cliente with id ${clienteId} does not exist`);
      }

      // Calcular tabla de amortización y cuota/comisión estimada si el request incluye tasa y frecuencia numéricas
      try {
        const tasaNum = solicitudData.tasa !== undefined ? Number(solicitudData.tasa) : undefined;
        const frecuenciaNum = solicitudData.frecuencia !== undefined ? Number(solicitudData.frecuencia) : undefined;

        if (tasaNum !== undefined && !Number.isNaN(tasaNum) && frecuenciaNum !== undefined && !Number.isNaN(frecuenciaNum)) {
          // plazoCuotas en el modelo es número de cuotas; convertir a años para la función (años = plazoCuotas / frecuencia)
          const plazoAnios = Number(plazoCuotas) / Number(frecuenciaNum);
          const schedule = amortizacionService.generateAmortization({ capital: Number(capitalSolicitado), tasa: Number(tasaNum), frecuencia: Number(frecuenciaNum), plazo: plazoAnios });

          // Guardar tabla de amortización
          solicitudData.tablaAmortizacion = schedule.calendario;

          // cuota base estimada
          solicitudData.cuotaEstimado = schedule.cuota;

          // calcular comisión estimada
          // Por defecto tomar 2% si el frontend no envía `comisionPorcentaje`
          const defaultCommissionRate = 0.02;
          const commissionRate = solicitudData.comisionPorcentaje !== undefined ? Number(solicitudData.comisionPorcentaje) : defaultCommissionRate;
          const comisionMonto = parseFloat((Number(capitalSolicitado) * commissionRate).toFixed(2));
          const cuotaAdicional = schedule.numeroPagos ? parseFloat((comisionMonto / schedule.numeroPagos).toFixed(2)) : parseFloat(comisionMonto.toFixed(2));

          solicitudData.cuotaEstimadaComision = {
            porcentaje: commissionRate,
            monto: comisionMonto,
            cuotaAdicionalPorPeriodo: cuotaAdicional,
          };
        }
      } catch (errCalc) {
        // No bloquear creación por errores en cálculo; registrar el error si se necesita (por ahora re-lanzamos para visibilidad)
        throw new Error(`Error calculando amortización/comisión: ${errCalc.message}`);
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
      const solicitud = await Solicitud.findOne({ codigoSolicitud })
        .populate('clienteId')
        .populate('vendedorId')
        .populate('tasInteresId')
        .populate('frecuenciaPagoId')
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
      const solicitudes = await Solicitud.find()
        .populate('clienteId')
        .populate('vendedorId')
        .populate('tasInteresId')
        .populate('frecuenciaPagoId')
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
        { codigoSolicitud },
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
      const solicitud = await Solicitud.findOneAndDelete({ codigoSolicitud });

      if (!solicitud) {
        throw new Error(`Solicitud with codigoSolicitud ${codigoSolicitud} does not exist`);
      }
      return { message: 'Solicitud deleted successfully' };
    } catch (error) {
      throw error;
    }
  },

  getSolicitudesByCliente: async (clienteId) => {
    try {
      const solicitudes = await Solicitud.find({ clienteId })
        .populate('clienteId')
        .populate('vendedorId')
        .populate('tasInteresId')
        .populate('frecuenciaPagoId')
        .populate('usuarioCreacionId')
        .populate('usuarioDecisionId');

      return solicitudes;
    } catch (error) {
      throw error;
    }
  },

  getSolicitudesByVendedor: async (vendedorId) => {
    try {
      const solicitudes = await Solicitud.find({ vendedorId })
        .populate('clienteId')
        .populate('vendedorId')
        .populate('tasInteresId')
        .populate('frecuenciaPagoId')
        .populate('usuarioCreacionId')
        .populate('usuarioDecisionId');

      return solicitudes;
    } catch (error) {
      throw error;
    }
  },

  getSolicitudesByEstado: async (estadoSolicitud) => {
    try {
      if (!['REGISTRADA', 'EN_REVISIÓN', 'APROBADA', 'RECHAZADA'].includes(estadoSolicitud)) {
        throw new Error('Invalid estado value');
      }

      const solicitudes = await Solicitud.find({ estadoSolicitud })
        .populate('clienteId')
        .populate('vendedorId')
        .populate('tasInteresId')
        .populate('frecuenciaPagoId')
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

      if (!['REGISTRADA', 'EN_REVISIÓN', 'APROBADA', 'RECHAZADA'].includes(estadoSolicitud)) {
        throw new Error('Invalid estado value');
      }

      const solicitud = await Solicitud.findOneAndUpdate(
        { codigoSolicitud },
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

      // Filtros disponibles
      if (filters.clienteId) query.clienteId = filters.clienteId;
      if (filters.vendedorId) query.vendedorId = filters.vendedorId;
      if (filters.estadoSolicitud) query.estadoSolicitud = filters.estadoSolicitud;
      if (filters.finalidadCredito) query.finalidadCredito = new RegExp(filters.finalidadCredito, 'i');

      // Rango de capital solicitado
      if (filters.capitalMin || filters.capitalMax) {
        query.capitalSolicitado = {};
        if (filters.capitalMin) query.capitalSolicitado.$gte = filters.capitalMin;
        if (filters.capitalMax) query.capitalSolicitado.$lte = filters.capitalMax;
      }

      // Rango de fechas
      if (filters.fechaInicio || filters.fechaFin) {
        query.fechaSolicitud = {};
        if (filters.fechaInicio) query.fechaSolicitud.$gte = new Date(filters.fechaInicio);
        if (filters.fechaFin) query.fechaSolicitud.$lte = new Date(filters.fechaFin);
      }

      const solicitudes = await Solicitud.find(query)
        .populate('clienteId')
        .populate('vendedorId')
        .populate('tasInteresId')
        .populate('frecuenciaPagoId')
        .populate('usuarioCreacionId')
        .populate('usuarioDecisionId')
        .sort({ fechaSolicitud: -1 });

      return solicitudes;
    } catch (error) {
      throw error;
    }
  },
};