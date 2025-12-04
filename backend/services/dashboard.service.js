import { financiamientoRepository } from "../repositories/financiamiento.repository.js";
import { abonoRepository } from "../repositories/abono.repository.js";

export const dashboardService = {
  getResumenDashboard: async () => {
    // Fechas base: hoy, hoy+1, hoy+7
    const ahora = new Date();
    const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const finHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1);

    const sieteDiasDespues = new Date(inicioHoy);
    sieteDiasDespues.setDate(sieteDiasDespues.getDate() + 7);

    const [
      prestamosActivos,
      prestamosEnMora,
      prestamosPagados,
      montoTotalColocado,
      vencenEn7Dias,
      prestamosRecientesRaw,
      pagosHoyRaw,
    ] = await Promise.all([
      financiamientoRepository.countByEstado('VIGENTE'),
      financiamientoRepository.countByEstado('EN_MORA'),
      financiamientoRepository.countByEstado('PAGADO'),
      financiamientoRepository.sumCapitalInicialActivos(),
      financiamientoRepository.countVencenEntre(inicioHoy, sieteDiasDespues),
      financiamientoRepository.findRecientes(10),
      abonoRepository.findByFechaRango(inicioHoy, finHoy),
    ]);

    const prestamosRecientes = prestamosRecientesRaw.map((f) => ({
      id: f._id,
      codigo: f.codigoFinanciamiento,
      cliente: f.clienteId
        ? {
            id: f.clienteId._id,
            codigoCliente: f.clienteId.codigoCliente,
            identidadCliente: f.clienteId.identidadCliente,
          }
        : null,
      monto: f.capitalInicial,
      saldo: f.saldoCapital,
      estado: f.estadoFinanciamiento,
      fechaDesembolso: f.fechaDesembolso,
      fechaVencimiento: f.fechaVencimiento,
    }));

    const pagosHoy = pagosHoyRaw.map((a) => ({
      id: a._id,
      codigoFinanciamiento: a.financiamientoId
        ? a.financiamientoId.codigoFinanciamiento
        : null,
      monto: a.montoAbono,
      fechaAbono: a.fechaAbono,
      cliente: a.clienteId
        ? {
            id: a.clienteId._id,
            codigoCliente: a.clienteId.codigoCliente,
            identidadCliente: a.clienteId.identidadCliente,
          }
        : null,
    }));

    return {
      prestamosActivos,
      prestamosEnMora,
      prestamosPagados,
      montoTotalColocado,
      vencenEn7Dias,
      distribucionEstados: {
        VIGENTE: prestamosActivos,
        EN_MORA: prestamosEnMora,
        PAGADO: prestamosPagados,
      },
      prestamosRecientes,
      pagosHoy,
    };
  },
};
