import { pagoRepository } from "../repositories/pago.repository.js";
import { financiamientoRepository } from "../repositories/financiamiento.repository.js";

export const pagoService = {
  _isValidDate: (d) => {
    if (d === null || d === undefined || d === '') return false;
    const date = new Date(d);
    return !Number.isNaN(date.getTime());
  },

  _validateCreateData: (data) => {
    const required = ['codigoPago', 'financiamientoId', 'clienteId', 'cobradorId', 'fechaPago', 'montoPago', 'tipoPago'];
    const missing = [];
    for (const key of required) {
      if (data[key] === undefined || data[key] === null) missing.push(key);
    }
    if (missing.length) throw new Error(`Missing required fields: ${missing.join(', ')}`);

    if (!pagoService._isValidDate(data.fechaPago)) throw new Error('fechaPago must be a valid date');
    if (typeof data.montoPago !== 'number') throw new Error('montoPago must be a number');
    ['aplicadoAMora', 'aplicadoAInteres', 'aplicadoACapital', 'saldoCapitalDespues'].forEach((k) => {
      if (data[k] !== undefined && typeof data[k] !== 'number') throw new Error(`${k} must be a number`);
    });
    if (data.metodoPago !== undefined && typeof data.metodoPago !== 'string') throw new Error('metodoPago must be a string');
    if (data.tipoPago !== undefined && typeof data.tipoPago !== 'string') throw new Error('tipoPago must be a string');
  },

  _validateUpdateData: (updateData) => {
    if (!updateData || typeof updateData !== 'object') throw new Error('Invalid update payload');

    if (updateData.fechaPago !== undefined && !pagoService._isValidDate(updateData.fechaPago)) throw new Error('fechaPago must be a valid date');
    if (updateData.montoPago !== undefined && typeof updateData.montoPago !== 'number') throw new Error('montoPago must be a number');
    ['aplicadoAMora', 'aplicadoAInteres', 'aplicadoACapital', 'saldoCapitalDespues'].forEach((k) => {
      if (updateData[k] !== undefined && typeof updateData[k] !== 'number') throw new Error(`${k} must be a number`);
    });
  },

  // ==== REGISTRAR PAGO CON ACTUALIZACIÓN DE SALDO ====
  createPago: async (data) => {
    // 1) Crear el pago normalmente
    const nuevoPago = await pagoRepository.createPago(data);

    // 2) Si está vinculado a un financiamiento, actualizamos su saldo
    if (nuevoPago && nuevoPago.financiamientoId && nuevoPago.montoPago) {
      const financiamiento = await financiamientoRepository.findById(nuevoPago.financiamientoId);

      if (financiamiento) {
        const saldoActual =
          financiamiento.saldoCapital != null
            ? financiamiento.saldoCapital
            : financiamiento.capitalInicial || 0;

        const montoPago = Number(nuevoPago.montoPago) || 0;

        let nuevoSaldo = saldoActual - montoPago;
        if (nuevoSaldo < 0) nuevoSaldo = 0;

        let nuevoEstado = financiamiento.estadoFinanciamiento;

        // Regla simple: si el saldo llega a 0 -> marcado como PAGADO
        if (nuevoSaldo === 0) {
          nuevoEstado = "PAGADO";
        }

        await financiamientoRepository.updateFinanciamientoById(financiamiento._id, {
          saldoCapital: nuevoSaldo,
          estadoFinanciamiento: nuevoEstado,
        });
      }
    }

    return nuevoPago;
  },


  getByFinanciamientoId: async (financiamientoId) => {
    return await pagoRepository.findByFinanciamientoId(financiamientoId);
  },

  getByClienteId: async (clienteId) => {
    return await pagoRepository.findByClienteId(clienteId);
  },

  getById: async (id) => {
    const item = await pagoRepository.findById(id);
    if (!item) throw new Error('Pago not found');
    return item;
  },

  getByCodigo: async (codigoPago) => {
    const item = await pagoRepository.findByCodigoPago(codigoPago);
    if (!item) throw new Error('Pago not found');
    return item;
  },

  getAll: async () => {
    return await pagoRepository.findAllPagos();
  },

  updateById: async (id, updateData) => {
    pagoService._validateUpdateData(updateData);
    const updated = await pagoRepository.updateById(id, updateData);
    return updated;
  },

  updateByCodigo: async (codigoPago, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'codigoPago')) delete updateData.codigoPago;
    pagoService._validateUpdateData(updateData);
    const existing = await pagoRepository.findByCodigoPago(codigoPago);
    if (!existing) throw new Error('Pago with the provided codigoPago does not exist.');
    const updated = await pagoRepository.updateByCodigoPago(codigoPago, updateData);
    return updated;
  },

  // ==== NUEVO: obtener pagos por rango de fechas ====
  getPagosPorRango: async (desde, hasta) => {
    // 'desde' y 'hasta' vienen como strings tipo '2025-12-04' o '2025-12-04T00:00:00'
    let fechaDesde = null;
    let fechaHasta = null;

    if (desde) {
      fechaDesde = new Date(desde);
    }
    if (hasta) {
      fechaHasta = new Date(hasta);
    }

    return await pagoRepository.findByFechaRango(fechaDesde, fechaHasta);
  },

  // ==== NUEVO: obtener pagos de HOY ====
  getPagosHoy: async () => {
    const ahora = new Date();
    const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const finHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1);

    return await pagoRepository.findByFechaRango(inicioHoy, finHoy);
  },


  deleteById: async (id) => {
    return await pagoRepository.deleteById(id);
  },

  deleteByCodigo: async (codigoPago) => {
    if (!codigoPago) throw new Error('codigoPago is required for deleting pago');
    const existing = await pagoRepository.findByCodigoPago(codigoPago);
    if (!existing) throw new Error('Pago with the provided codigoPago does not exist.');
    return await pagoRepository.deleteByCodigoPago(codigoPago);
  }
};
