import { financiamientoRepository } from "../repositories/financiamiento.repository.js";

export const reportesService = {
    // Cartera actual: agrupada por estado y producto
    getCarteraActual: async () => {
        const grupos = await financiamientoRepository.getCarteraActualAgrupada();

        // También podemos calcular totales generales
        let totalPrestamos = 0;
        let montoTotal = 0;
        let saldoTotal = 0;

        for (const g of grupos) {
            totalPrestamos += g.totalPrestamos || 0;
            montoTotal += g.montoTotal || 0;
            saldoTotal += g.saldoTotal || 0;
        }

        return {
            totalPrestamos,
            montoTotal,
            saldoTotal,
            detalle: grupos,
        };
    },

    // Mora por límite de días (ej: 30 días)
    getMoraPorDias: async (dias = 30) => {
        const lista = await financiamientoRepository.getFinanciamientosEnMoraDesdeDias(dias);

        let cantidad = lista.length;
        let montoCapital = 0;
        let saldoCapital = 0;

        for (const f of lista) {
            montoCapital += f.capitalInicial || 0;
            saldoCapital += f.saldoCapital || 0;
        }

        return {
            dias,
            cantidad,
            montoCapital,
            saldoCapital,
            detalle: lista,
        };
    },

    // Colocación por mes en un rango de fechas
    getColocacionMensual: async (desdeStr, hastaStr) => {
        let desde = null;
        let hasta = null;

        if (desdeStr) desde = new Date(desdeStr);
        if (hastaStr) hasta = new Date(hastaStr);

        const datos = await financiamientoRepository.getColocacionPorMes(desde, hasta);

        return {
            desde: desdeStr || null,
            hasta: hastaStr || null,
            series: datos,
        };
    },
};
