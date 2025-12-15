// services/financiamiento.service.js
import { financiamientoRepository } from "../repositories/financiamiento.repository.js";
import { clienteRepository } from "../repositories/cliente.repository.js";
import { abonoRepository } from "../repositories/abono.repository.js";
// si tu repo de cobradores se llama distinto, ajústalo:
// import { empleadoRepository } from "../repositories/user.repository.js"; // use if needed

const FRECUENCIA_MAP = {
  "Días": "DIARIA",
  "Dias": "DIARIA",
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

export const financiamientoService = {
  // ----------------- Helpers internos -----------------
  _isValidDate: (d) => {
    if (d === null || d === undefined || d === "") return false;
    const date = new Date(d);
    return !Number.isNaN(date.getTime());
  },

  _validateCreateData: (data) => {
    const required = [
      "codigoFinanciamiento",
      "clienteId",
      "capitalInicial",
      "saldoCapital",
      "cuota",
      "fechaDesembolso",
      "fechaVencimiento",
      "estadoFinanciamiento",
    ];

    const missing = [];
    for (const key of required) {
      if (data[key] === undefined || data[key] === null) missing.push(key);
    }
    if (missing.length) {
      throw new Error(
        `Missing required fields: ${missing.join(", ")}`
      );
    }

    if (typeof data.capitalInicial !== "number")
      throw new Error("capitalInicial must be a number");
    if (typeof data.saldoCapital !== "number")
      throw new Error("saldoCapital must be a number");
    if (typeof data.cuota !== "number")
      throw new Error("cuota must be a number");

    if (!financiamientoService._isValidDate(data.fechaDesembolso))
      throw new Error("fechaDesembolso must be a valid date");
    if (!financiamientoService._isValidDate(data.fechaVencimiento))
      throw new Error("fechaVencimiento must be a valid date");

    if (typeof data.estadoFinanciamiento !== "string")
      throw new Error("estadoFinanciamiento must be a string");
  },

  _validateUpdateData: (updateData) => {
    if (!updateData || typeof updateData !== "object") {
      throw new Error("Invalid update payload");
    }

    // No permitir cambiar el código
    if (
      Object.prototype.hasOwnProperty.call(
        updateData,
        "codigoFinanciamiento",
      )
    ) {
      throw new Error("codigoFinanciamiento cannot be updated");
    }

    if (
      updateData.capitalInicial !== undefined &&
      typeof updateData.capitalInicial !== "number"
    ) {
      throw new Error("capitalInicial must be a number");
    }

    if (
      updateData.saldoCapital !== undefined &&
      typeof updateData.saldoCapital !== "number"
    ) {
      throw new Error("saldoCapital must be a number");
    }

    if (
      updateData.cuota !== undefined &&
      typeof updateData.cuota !== "number"
    ) {
      throw new Error("cuota must be a number");
    }

    if (
      updateData.fechaDesembolso !== undefined &&
      !financiamientoService._isValidDate(updateData.fechaDesembolso)
    ) {
      throw new Error("fechaDesembolso must be a valid date");
    }

    if (
      updateData.fechaVencimiento !== undefined &&
      !financiamientoService._isValidDate(updateData.fechaVencimiento)
    ) {
      throw new Error("fechaVencimiento must be a valid date");
    }
  },

  // ----------------- CRUD básico -----------------

  createFinanciamiento: async (data) => {
    financiamientoService._validateCreateData(data);

    const existing =
      await financiamientoRepository.findByCodigoFinanciamiento(
        data.codigoFinanciamiento,
      );
    if (existing) {
      throw new Error(
        "A financiamiento with this codigoFinanciamiento already exists.",
      );
    }

    // La tabla de amortización va por otro servicio/colección
    return await financiamientoRepository.createFinanciamiento(data);
  },

  updateFinanciamientoByCodigo: async (codigoFinanciamiento, updateData) => {
    // Por si alguien intenta colar el código en el body
    if (
      updateData &&
      Object.prototype.hasOwnProperty.call(
        updateData,
        "codigoFinanciamiento",
      )
    ) {
      delete updateData.codigoFinanciamiento;
    }

    financiamientoService._validateUpdateData(updateData);

    const existing =
      await financiamientoRepository.findByCodigoFinanciamiento(
        codigoFinanciamiento,
      );
    if (!existing) {
      throw new Error(
        "Financiamiento with the provided codigoFinanciamiento does not exist.",
      );
    }

    const updated =
      await financiamientoRepository.updateFinanciamientoByCodigo(
        codigoFinanciamiento,
        updateData,
      );
    return updated;
  },

  getAllFinanciamientos: async (filtros) => {
    return await financiamientoRepository.findAllFinanciamientos(filtros);
  },

  getFinanciamientoByCodigo: async (codigoFinanciamiento) => {
    const item =
      await financiamientoRepository.findByCodigoFinanciamiento(
        codigoFinanciamiento,
      );
    if (!item) {
      throw new Error(
        "Financiamiento with the provided codigoFinanciamiento does not exist.",
      );
    }
    return item;
  },

  getFinanciamientoById: async (id) => {
    const item = await financiamientoRepository.findById(id);
    if (!item) {
      throw new Error(
        "Financiamiento with the provided id does not exist.",
      );
    }
    return item;
  },

  deleteFinanciamientoByCodigo: async (codigoFinanciamiento) => {
    if (!codigoFinanciamiento) {
      throw new Error(
        "codigoFinanciamiento is required for deleting financiamiento.",
      );
    }
    const existing =
      await financiamientoRepository.findByCodigoFinanciamiento(
        codigoFinanciamiento,
      );
    if (!existing) {
      throw new Error(
        "Financiamiento with the provided codigoFinanciamiento does not exist.",
      );
    }
    return await financiamientoRepository.deleteByCodigoFinanciamiento(
      codigoFinanciamiento,
    );
  },

  // ----------------- NUEVO: Resumen para la tabla del front -----------------

  /**
   * Devuelve un arreglo de "resúmenes" de financiamientos
   * para usar en la tabla de préstamos del frontend.
   */
  getFinanciamientosResumen: async () => {
    // Puedes pasar filtros si quieres, por ahora traemos todo
    const docs = await financiamientoRepository.findAllFinanciamientos({});

    if (!docs || docs.length === 0) return [];

    const resumen = docs.map((f) => ({
      id: f._id.toString(),
      codigoFinanciamiento: f.codigoFinanciamiento || f.codigo || "",
      // si guardas referencia, ajústalo a como lo tengas:
      clienteId: f.clienteId ? f.clienteId.toString() : null,
      codigoCliente: f.codigoCliente || null,
      nombreCliente:
        f.nombreCliente || // si ya lo guardas denormalizado
        "", // lo podemos enriquecer en otra pasada si hace falta
      capitalInicial: Number(f.capitalInicial ?? 0),
      saldoCapital: Number(f.saldoCapital ?? 0),
      fechaDesembolso: f.fechaDesembolso
        ? new Date(f.fechaDesembolso).toISOString()
        : null,
      estadoFinanciamiento: f.estadoFinanciamiento || f.estado || "VIGENTE",
    }));

    return resumen;
  },

  // ----------------- NUEVO: Detalle para PrestamoDetalle -----------------

  /**
   * Devuelve el detalle completo de un financiamiento,
   * con cliente, cobrador, abonos y totalAbonado,
   * en el shape que usa el frontend (PrestamoDetalle).
   */
  getPrestamoDetalleById: async (id) => {
    // 1) Financiamiento base
    const f = await financiamientoRepository.findById(id);
    if (!f) return null;

    // 2) Cliente
    let cliente = null;
    if (f.clienteId) {
      const c = await clienteRepository.findById(f.clienteId);
      if (c) {
        const nombreCompleto =
          c.nombreCompleto ||
          [c.nombre, c.apellido].filter(Boolean).join(" ") ||
          "Cliente";

        cliente = {
          id: c._id.toString(),
          nombreCompleto,
          identidadCliente: c.identidadCliente || undefined,
          codigoCliente: c.codigoCliente || undefined,
        };
      }
    }

    // 3) Cobrador (si aplica en tu modelo)
    let cobrador = null;
    if (f.cobradorId) {
      const cob = await cobradorRepository.findById(f.cobradorId);
      if (cob) {
        const nombreCompleto =
          cob.nombreCompleto ||
          [cob.nombre, cob.apellido].filter(Boolean).join(" ") ||
          "Cobrador";

        cobrador = {
          id: cob._id.toString(),
          nombreCompleto,
          codigo: cob.codigo || undefined,
        };
      }
    }

    // 4) Abonos asociados a este financiamiento
    const abonosDocs = await abonoRepository.findByFinanciamientoId(f._id);
    const abonos = (abonosDocs || []).map((a) => ({
      id: a._id.toString(),
      fecha: a.fecha ? a.fecha.toISOString() : null,
      montoCapital: Number(a.montoCapital ?? 0),
      montoInteres: Number(a.montoInteres ?? 0),
      montoMora: Number(a.montoMora ?? 0),
      // agrega aquí cualquier otro campo que use tu PrestamoAbono del front
    }));

    const totalAbonado = abonos.reduce(
      (acc, a) => acc + a.montoCapital + a.montoInteres + a.montoMora,
      0,
    );

    // 5) DTO final compatibile con PrestamoDetalle del frontend
    return {
      id: f._id.toString(),
      codigoFinanciamiento: f.codigoFinanciamiento || f.codigo || "",
      capitalInicial: Number(f.capitalInicial ?? 0),
      saldoCapital: Number(f.saldoCapital ?? 0),
      tasaInteresAnual: f.tasaInteresAnual ?? f.tasa ?? undefined,
      estadoFinanciamiento: f.estadoFinanciamiento || f.estado || "VIGENTE",
      fechaDesembolso: f.fechaDesembolso
        ? f.fechaDesembolso.toISOString()
        : undefined,
      fechaVencimiento: f.fechaVencimiento
        ? f.fechaVencimiento.toISOString()
        : undefined,
      cliente,
      cobrador,
      abonos,
      totalAbonado,
    };
  },
};
