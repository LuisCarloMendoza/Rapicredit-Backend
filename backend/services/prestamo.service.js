import { prestamoRepository } from "../repositories/prestamo.repository.js";

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

export const prestamoService = {
    _isValidDate: (d) => {
        if (d === null || d === undefined || d === "") return false;
        const date = new Date(d);
        return !Number.isNaN(date.getTime());
    },

    _validateCreateData: (data) => {
        const required = [
            "codigoPrestamo",
            "clienteId",
            "capitalInicial",
            "saldoCapital",
            "cuota",
            "frecuenciaPago",
            "fechaDesembolso",
            "fechaVencimiento",
            "estadoPrestamo",
        ];

        const missing = required.filter((k) => data[k] === undefined || data[k] === null);
        if (missing.length) throw new Error(`Missing required fields: ${missing.join(", ")}`);

        if (typeof data.capitalInicial !== "number") throw new Error("capitalInicial must be a number");
        if (typeof data.saldoCapital !== "number") throw new Error("saldoCapital must be a number");
        if (typeof data.cuota !== "number") throw new Error("cuota must be a number");
        if (!prestamoService._isValidDate(data.fechaDesembolso)) throw new Error("fechaDesembolso must be a valid date");
        if (!prestamoService._isValidDate(data.fechaVencimiento)) throw new Error("fechaVencimiento must be a valid date");
        if (typeof data.estadoPrestamo !== "string") throw new Error("estadoPrestamo must be a string");

        // frecuenciaPago: valida por normalización
        normalizeFrecuenciaPago(data.frecuenciaPago);
    },

    createPrestamo: async (data) => {
        const payload = {
            ...data,
            frecuenciaPago: normalizeFrecuenciaPago(data.frecuenciaPago),
        };

        prestamoService._validateCreateData(payload);

        const existing = await prestamoRepository.findByCodigoPrestamo(payload.codigoPrestamo);
        if (existing) throw new Error("A prestamo with this codigoPrestamo already exists.");

        return await prestamoRepository.create(payload);
    },

    getPrestamoById: async (id) => {
        const item = await prestamoRepository.findById(id);
        if (!item) throw new Error("Prestamo with the provided id does not exist.");
        return item;
    },

    getPrestamoByCodigo: async (codigoPrestamo) => {
        const item = await prestamoRepository.findByCodigoPrestamo(codigoPrestamo);
        if (!item) throw new Error("Prestamo with the provided codigoPrestamo does not exist.");
        return item;
    },

    getAllPrestamos: async (filtros = {}) => {
        return await prestamoRepository.findAll(filtros);
    },

    updatePrestamoByCodigo: async (codigoPrestamo, updateData) => {
        const payload = { ...updateData };

        // No permitir cambiar el código
        if (Object.prototype.hasOwnProperty.call(payload, "codigoPrestamo")) {
            delete payload.codigoPrestamo;
        }

        // normalizar frecuencia si viene
        if (Object.prototype.hasOwnProperty.call(payload, "frecuenciaPago")) {
            payload.frecuenciaPago = normalizeFrecuenciaPago(payload.frecuenciaPago);
        }

        const existing = await prestamoRepository.findByCodigoPrestamo(codigoPrestamo);
        if (!existing) throw new Error("Prestamo with the provided codigoPrestamo does not exist.");

        return await prestamoRepository.updateByCodigo(codigoPrestamo, payload);
    },

    deletePrestamoByCodigo: async (codigoPrestamo) => {
        const existing = await prestamoRepository.findByCodigoPrestamo(codigoPrestamo);
        if (!existing) throw new Error("Prestamo with the provided codigoPrestamo does not exist.");

        return await prestamoRepository.deleteByCodigo(codigoPrestamo);
    },
};
