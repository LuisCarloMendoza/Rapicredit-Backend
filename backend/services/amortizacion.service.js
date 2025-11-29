import { amortizacionRepository } from "../repositories/amortizacion.repository.js";

export const amortizacionService = {
  _isValidDate: (d) => {
    if (d === null || d === undefined || d === '') return false;
    const date = new Date(d);
    return !Number.isNaN(date.getTime());
  },

  _validateCreateData: (data) => {
    const required = ['financiamientoId', 'fecha', 'capital', 'interes', 'saldoCapital'];
    const missing = [];
    for (const key of required) {
      if (data[key] === undefined || data[key] === null) missing.push(key);
    }
    if (missing.length) throw new Error(`Missing required fields: ${missing.join(', ')}`);

    if (!amortizacionService._isValidDate(data.fecha)) throw new Error('fecha must be a valid date');
    if (typeof data.capital !== 'number') throw new Error('capital must be a number');
    if (typeof data.interes !== 'number') throw new Error('interes must be a number');
    if (data.mora !== undefined && typeof data.mora !== 'number') throw new Error('mora must be a number');
    if (typeof data.saldoCapital !== 'number') throw new Error('saldoCapital must be a number');
    if (data.pagado !== undefined && typeof data.pagado !== 'boolean') throw new Error('pagado must be a boolean');
    if (data.orden !== undefined && typeof data.orden !== 'number') throw new Error('orden must be a number');
  },

  _validateUpdateData: (updateData) => {
    if (!updateData || typeof updateData !== 'object') throw new Error('Invalid update payload');
    if (Object.prototype.hasOwnProperty.call(updateData, 'financiamientoId')) throw new Error('financiamientoId cannot be updated');

    if (updateData.fecha !== undefined && !amortizacionService._isValidDate(updateData.fecha)) throw new Error('fecha must be a valid date');
    if (updateData.capital !== undefined && typeof updateData.capital !== 'number') throw new Error('capital must be a number');
    if (updateData.interes !== undefined && typeof updateData.interes !== 'number') throw new Error('interes must be a number');
    if (updateData.mora !== undefined && typeof updateData.mora !== 'number') throw new Error('mora must be a number');
    if (updateData.saldoCapital !== undefined && typeof updateData.saldoCapital !== 'number') throw new Error('saldoCapital must be a number');
    if (updateData.pagado !== undefined && typeof updateData.pagado !== 'boolean') throw new Error('pagado must be a boolean');
    if (updateData.orden !== undefined && typeof updateData.orden !== 'number') throw new Error('orden must be a number');
  },

  create: async (data) => {
    amortizacionService._validateCreateData(data);
    const created = await amortizacionRepository.create(data);
    return created;
  },

  getByFinanciamientoId: async (financiamientoId) => {
    return await amortizacionRepository.findByFinanciamientoId(financiamientoId);
  },

  getById: async (id) => {
    const item = await amortizacionRepository.findById(id);
    if (!item) throw new Error('Amortizacion not found');
    return item;
  },

  updateById: async (id, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'financiamientoId')) {
      delete updateData.financiamientoId;
    }
    amortizacionService._validateUpdateData(updateData);
    const updated = await amortizacionRepository.updateById(id, updateData);
    return updated;
  },

  deleteById: async (id) => {
    return await amortizacionRepository.deleteById(id);
  }
,

  generateAmortizacion: ({ capital, tasa, frecuencia, plazo }) => {
    // Basic validation and normalization
    const c = Number(capital);
    const t = Number(tasa);
    const f = Number(frecuencia);
    const p = Number(plazo);

    if (!Number.isFinite(c) || c <= 0) throw new Error('capital must be a positive number');
    if (!Number.isFinite(t) || t <= 0) throw new Error('tasa must be a positive number');
    if (!Number.isFinite(f) || f <= 0) throw new Error('frecuencia must be a positive number');
    if (!Number.isFinite(p) || p <= 0) throw new Error('plazo must be a positive number');

    const saldoInicial = c;
    const tasaPeriodica = t / f;
    const numeroPagos = f * p;

    // Annuity payment formula
    const cuota =
      saldoInicial *
      (tasaPeriodica * Math.pow(1 + tasaPeriodica, numeroPagos)) /
      (Math.pow(1 + tasaPeriodica, numeroPagos) - 1);

    let saldo = saldoInicial;
    const calendario = [];

    for (let i = 1; i <= numeroPagos; i++) {
      const interes = saldo * tasaPeriodica;
      const amortizacion = cuota - interes;
      const saldoFinal = saldo - amortizacion;

      calendario.push({
        periodo: i,
        saldoInicial: parseFloat(saldo.toFixed(2)),
        cuota: parseFloat(cuota.toFixed(2)),
        interes: parseFloat(interes.toFixed(2)),
        amortizacion: parseFloat(amortizacion.toFixed(2)),
        saldoFinal: parseFloat(saldoFinal.toFixed(2)),
      });

      saldo = saldoFinal;
    }

    return {
      capital: saldoInicial,
      tasaPeriodica,
      numeroPagos,
      cuota: parseFloat(cuota.toFixed(2)),
      calendario,
    };
  }
};
