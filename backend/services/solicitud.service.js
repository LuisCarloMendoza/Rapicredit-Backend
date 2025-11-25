import Solicitud from '../models/solicitud.model.js';
import Cliente from '../models/cliente.model.js';

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