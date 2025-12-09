import ExcelJS from 'exceljs';
import Solicitud from '../models/solicitud.model.js';

const getWeekNumber = (d) => {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
  const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1)/7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2,'0')}`;
};

const getPeriodKey = (d, frequency) => {
  const date = new Date(d);
  const year = date.getFullYear();
  if (frequency === 'weekly') return getWeekNumber(date);
  if (frequency === 'monthly') return `${year}-${String(date.getMonth()+1).padStart(2,'0')}`;
  if (frequency === 'quarterly') {
    const quarter = Math.floor(date.getMonth()/3) + 1;
    return `${year}-Q${quarter}`;
  }
  if (frequency === 'yearly') return `${year}`;
  return null;
};

export const solicitudReportService = {
  generateApprovedSolicitudesWorkbook: async ({ frequency = 'monthly', from, to }) => {
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;

    const query = { estadoSolicitud: 'APROBADA' };
    if (fromDate || toDate) query.fechaSolicitud = {};
    if (fromDate) query.fechaSolicitud.$gte = fromDate;
    if (toDate) query.fechaSolicitud.$lte = toDate;

    const solicitudes = await Solicitud.find(query)
      .populate('clienteId')
      .populate('vendedorId')
      .sort({ fechaSolicitud: 1 });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Solicitudes Aprobadas');

    sheet.columns = [
      { header: 'Código', key: 'codigo', width: 20 },
      { header: 'Cliente', key: 'cliente', width: 30 },
      { header: 'Vendedor', key: 'vendedor', width: 30 },
      { header: 'Capital Solicitado', key: 'capital', width: 18 },
      { header: 'Fecha Solicitud', key: 'fecha', width: 20 },
      { header: 'Plazo (cuotas)', key: 'plazo', width: 12 },
      { header: 'Cuota Estimada', key: 'cuota', width: 14 },
      { header: 'Comisión Estimada (monto)', key: 'comision', width: 18 },
    ];

    for (const s of solicitudes) {
      sheet.addRow({
        codigo: s.codigoSolicitud,
        cliente: s.clienteId ? (s.clienteId.nombre ? `${s.clienteId.nombre} ${s.clienteId.apellido || ''}`.trim() : s.clienteId.codigoCliente || '') : '',
        vendedor: s.vendedorId ? (s.vendedorId.nombreCompleto || s.vendedorId.usuario || '') : '',
        capital: s.capitalSolicitado,
        fecha: s.fechaSolicitud ? s.fechaSolicitud.toISOString().split('T')[0] : '',
        plazo: s.plazoCuotas,
        cuota: s.cuotaEstimado || (s.tablaAmortizacion && s.tablaAmortizacion.length ? s.tablaAmortizacion[0].cuota : ''),
        comision: s.cuotaEstimadaComision ? s.cuotaEstimadaComision.monto : '',
      });
    }

    const summary = {};
    for (const s of solicitudes) {
      const key = getPeriodKey(s.fechaSolicitud, frequency) || 'ALL';
      if (!summary[key]) summary[key] = { count: 0, totalCapital: 0, totalComision: 0 };
      summary[key].count += 1;
      summary[key].totalCapital += Number(s.capitalSolicitado || 0);
      summary[key].totalComision += Number((s.cuotaEstimadaComision && s.cuotaEstimadaComision.monto) || 0);
    }

    const summarySheet = workbook.addWorksheet('Resumen');
    summarySheet.columns = [
      { header: 'Periodo', key: 'periodo', width: 20 },
      { header: 'Cantidad', key: 'cantidad', width: 12 },
      { header: 'Total Capital', key: 'totalCapital', width: 18 },
      { header: 'Total Comisión', key: 'totalComision', width: 18 },
    ];

    for (const [period, data] of Object.entries(summary)) {
      summarySheet.addRow({ periodo: period, cantidad: data.count, totalCapital: data.totalCapital, totalComision: data.totalComision });
    }

    [sheet, summarySheet].forEach(ws => {
      ws.getRow(1).font = { bold: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
};

export default solicitudReportService;
