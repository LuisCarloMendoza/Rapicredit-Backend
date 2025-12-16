import { prestamoRepository } from "../repositories/prestamo.repository.js";
import { clienteRepository } from "../repositories/cliente.repository.js";
import { pagoRepository } from "../repositories/pago.repository.js";
import { empleadoRepository } from "../repositories/empleado.repository.js"; // Para los cobradores/empleados
import { buildAmortizacion } from "../utils/amortizacion.js";  // El helper que calcula la cuota y las amortizaciones
import TasaInteres from "../models/tasa.model.js";
const FRECUENCIA_MAP = {
    "Días": "DIARIA",
    "Dias": "DIARIA",
    "DIAS": "DIARIA",
    "Semanas": "SEMANAL",
    "Quincenas": "QUINCENAL",
    "Quincenal": "QUINCENAL",
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
    // ----------------- Helpers internos -----------------
    _isValidDate: (d) => {
        if (d === null || d === undefined || d === "") return false;
        const date = new Date(d);
        return !Number.isNaN(date.getTime());
    },

    _validateCreateData: (data) => {
        // Validar los campos requeridos para crear un préstamo
        const required = [
            "codigoPrestamo",        // Código único del préstamo
            "clienteId",              // ID del cliente
            "capitalInicial",         // Capital solicitado
            "saldoCapital",           // Saldo del préstamo (igual a capitalInicial al inicio)
            "cuota",                  // Cuota calculada
            "fechaDesembolso",        // Fecha de desembolso
            "fechaVencimiento",       // Fecha de vencimiento
            "estadoPrestamo",         // Estado del préstamo
            "frecuenciaPago",         // Frecuencia de pago
            "tasaInteresId",          // ID de la tasa de interés
        ];

        const missing = [];
        for (const key of required) {
            if (data[key] === undefined || data[key] === null) missing.push(key);
        }
        if (missing.length) throw new Error(`Missing required fields: ${missing.join(", ")}`);

        if (typeof data.capitalInicial !== "number") throw new Error("capitalInicial must be a number");
        if (typeof data.saldoCapital !== "number") throw new Error("saldoCapital must be a number");
        if (typeof data.cuota !== "number") throw new Error("cuota must be a number");

        if (!prestamoService._isValidDate(data.fechaDesembolso)) throw new Error("fechaDesembolso must be a valid date");
        if (!prestamoService._isValidDate(data.fechaVencimiento)) throw new Error("fechaVencimiento must be a valid date");

        if (typeof data.estadoPrestamo !== "string") throw new Error("estadoPrestamo must be a string");

        // Normaliza y valida frecuencia
        data.frecuenciaPago = normalizeFrecuenciaPago(data.frecuenciaPago);
    },

    _validateUpdateData: (updateData) => {
        if (!updateData || typeof updateData !== "object") throw new Error("Invalid update payload");

        // No permitir cambiar el código del préstamo
        if (Object.prototype.hasOwnProperty.call(updateData, "codigoPrestamo")) {
            throw new Error("codigoPrestamo cannot be updated");
        }

        if (updateData.capitalInicial !== undefined && typeof updateData.capitalInicial !== "number") {
            throw new Error("capitalInicial must be a number");
        }
        if (updateData.saldoCapital !== undefined && typeof updateData.saldoCapital !== "number") {
            throw new Error("saldoCapital must be a number");
        }
        if (updateData.cuota !== undefined && typeof updateData.cuota !== "number") {
            throw new Error("cuota must be a number");
        }

        if (updateData.fechaDesembolso !== undefined && !prestamoService._isValidDate(updateData.fechaDesembolso)) {
            throw new Error("fechaDesembolso must be a valid date");
        }
        if (updateData.fechaVencimiento !== undefined && !prestamoService._isValidDate(updateData.fechaVencimiento)) {
            throw new Error("fechaVencimiento must be a valid date");
        }

        if (updateData.frecuenciaPago !== undefined) {
            updateData.frecuenciaPago = normalizeFrecuenciaPago(updateData.frecuenciaPago);
        }
    },

    // ----------------- CRUD básico -----------------
    createPrestamo: async (data) => {
        prestamoService._validateCreateData(data);

        const existing = await prestamoRepository.findByCodigoPrestamo(data.codigoPrestamo);
        if (existing) throw new Error("A prestamo with this codigoPrestamo already exists.");

        // Obtener la tasa de interés de la base de datos usando tasaInteresId
        const tasaInteres = await TasaInteres.findById(data.tasaInteresId);
        if (!tasaInteres) {
            throw new Error("Tasa de interés no encontrada");
        }

        const annualRate = tasaInteres.porcentajeInteres / 100;  // Convertir a porcentaje (ej. 12 -> 0.12)


        // Calcular la cuota y la amortización
        const { cuota, items } = buildAmortizacion({
            principal: Number(data.capitalSolicitado),
            annualRate,  // Tasa de interés anual (proporcionada en el payload)
            nCuotas: Number(data.plazoCuotas),  // Número de cuotas (proporcionado en el payload)
            freqCanon: data.frecuenciaPago,     // Frecuencia de pago (proporcionada en el payload)
            startDate: data.fechaDesembolso,    // Fecha de desembolso (proporcionada en el payload)
        });

        // Datos para crear el préstamo
        const prestamoData = {
            solicitudId: data.solicitudId,  // Relación con la solicitud
            clienteId: data.clienteId,      // ID del cliente
            tasaInteresId: data.tasaInteresId,  // ID de la tasa de interés
            frecuenciaPago: normalizeFrecuenciaPago(data.frecuenciaPago),
            capitalSolicitado: Number(data.capitalSolicitado),
            cuotaFija: Number(cuota),      // Cuota calculada
            plazoCuotas: Number(data.plazoCuotas),
            fechaDesembolso: data.fechaDesembolso,
            fechaVencimiento: data.fechaVencimiento,
            estadoPrestamo: "VIGENTE",     // Estado del préstamo
            amortizacionPreview: items,   // Vista previa de las amortizaciones (cuotas)
            activo: true,
        };

        // Crear el préstamo en la base de datos
        return await prestamoRepository.createPrestamo(prestamoData);
    },

    updatePrestamoByCodigo: async (codigoPrestamo, updateData) => {
        if (updateData && Object.prototype.hasOwnProperty.call(updateData, "codigoPrestamo")) {
            delete updateData.codigoPrestamo;
        }

        prestamoService._validateUpdateData(updateData);

        const existing = await prestamoRepository.findByCodigoPrestamo(codigoPrestamo);
        if (!existing) throw new Error("Prestamo with the provided codigoPrestamo does not exist.");

        return await prestamoRepository.updatePrestamoByCodigo(codigoPrestamo, updateData);
    },

    getAllPrestamos: async (filtros) => {
        return await prestamoRepository.findAllPrestamos(filtros);
    },

    getPrestamoByCodigo: async (codigoPrestamo) => {
        const item = await prestamoRepository.findByCodigoPrestamo(codigoPrestamo);
        if (!item) throw new Error("Prestamo with the provided codigoPrestamo does not exist.");
        return item;
    },

    getPrestamoById: async (id) => {
        const item = await prestamoRepository.findById(id);
        if (!item) throw new Error("Prestamo with the provided id does not exist.");
        return item;
    },

    deletePrestamoByCodigo: async (codigoPrestamo) => {
        if (!codigoPrestamo) throw new Error("codigoPrestamo is required for deleting prestamo.");

        const existing = await prestamoRepository.findByCodigoPrestamo(codigoPrestamo);
        if (!existing) throw new Error("Prestamo with the provided codigoPrestamo does not exist.");

        return await prestamoRepository.deleteByCodigoPrestamo(codigoPrestamo);
    },

    // ----------------- Resumen para tabla del front -----------------
    getPrestamosResumen: async () => {
        const docs = await prestamoRepository.findAllPrestamos({});

        if (!docs || docs.length === 0) return [];

        return docs.map((p) => ({
            id: p._id.toString(),
            codigoPrestamo: p.codigoPrestamo || p.codigo || "",
            clienteId: p.clienteId ? p.clienteId.toString?.() || p.clienteId : null,
            codigoCliente: p.clienteId?.codigoCliente || null,
            nombreCliente:
                p.clienteId?.nombreCompleto ||
                [p.clienteId?.nombre, p.clienteId?.apellido].filter(Boolean).join(" ") ||
                "",

            capitalInicial: Number(p.capitalInicial ?? p.capitalSolicitado ?? 0),
            saldoCapital: Number(p.saldoCapital ?? 0),
            fechaDesembolso: p.fechaDesembolso ? new Date(p.fechaDesembolso).toISOString() : null,
            estadoPrestamo: p.estadoPrestamo || "VIGENTE",
        }));
    },

    // ----------------- Detalle compatible con el front (PrestamoDetalle) -----------------
    getPrestamoDetalleById: async (id) => {
        const p = await prestamoRepository.findById(id);
        if (!p) return null;

        // 2) Cliente
        let cliente = null;
        if (p.clienteId) {
            const c = await clienteRepository.findById(p.clienteId);
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

        // 3) Empleado (cobrador o quien esté asignado al préstamo)
        let empleado = null;
        const empleadoId = p.empleadoAsignadoId || p.empleadoId || null;
        if (empleadoId) {
            const emp = await empleadoRepository.findById(empleadoId);
            if (emp) {
                empleado = {
                    id: emp._id.toString(),
                    nombreCompleto: emp.nombreCompleto,
                    codigo: emp.codigoUsuario || undefined,
                };
            }
        }

        // 4) Pagos/abonos asociados
        const pagosDocs =
            (await pagoRepository.findByPrestamoId?.(p._id)) ||
            (await pagoRepository.findByFinanciamientoId?.(p._id)) ||
            [];

        const abonos = (pagosDocs || []).map((x) => ({
            id: x._id.toString(),
            fecha: x.fechaPago ? new Date(x.fechaPago).toISOString() : null,
            montoCapital: Number(x.aplicadoACapital ?? 0),
            montoInteres: Number(x.aplicadoAInteres ?? 0),
            montoMora: Number(x.aplicadoAMora ?? 0),
        }));

        const totalAbonado = abonos.reduce(
            (acc, a) => acc + a.montoCapital + a.montoInteres + a.montoMora,
            0
        );

        // 5) DTO final
        return {
            id: p._id.toString(),
            codigoPrestamo: p.codigoPrestamo || "",
            capitalInicial: Number(p.capitalInicial ?? p.capitalSolicitado ?? 0),
            saldoCapital: Number(p.saldoCapital ?? 0),
            tasaInteresAnual: p.tasaInteresAnual ?? undefined,
            estadoPrestamo: p.estadoPrestamo || "VIGENTE",
            fechaDesembolso: p.fechaDesembolso ? new Date(p.fechaDesembolso).toISOString() : undefined,
            fechaVencimiento: p.fechaVencimiento ? new Date(p.fechaVencimiento).toISOString() : undefined,
            cliente,
            empleado,
            abonos,
            totalAbonado,
        };
    },
};
