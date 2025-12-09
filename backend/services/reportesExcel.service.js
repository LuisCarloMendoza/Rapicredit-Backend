import ExcelJS from 'exceljs';
import { reportesService } from './reportes.service.js';
import { solicitudReportService } from './solicitudReport.service.js';

const appendSheetsFromBuffer = async (targetWb, buffer) => {
  const tmp = new ExcelJS.Workbook();
  await tmp.xlsx.load(buffer);
  tmp.worksheets.forEach(src => {
    const ws = targetWb.addWorksheet(src.name);
    if (src.columns && src.columns.length) {
      ws.columns = src.columns.map(c => ({
        header: c.header,
        key: c.key,
        width: c.width || 15,
      }));
    }
    src.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      ws.addRow(row.values);
      if (rowNumber === 1) ws.getRow(1).font = { bold: true };
    });
  });
};

export const reportesExcelService = {
  // types: ['solicitudes-aprobadas','cartera-actual','mora','colocacion-mensual']
  // params: ver controlador
  generate: async ({ types = [], params = {} }) => {
    const wb = new ExcelJS.Workbook();

    // 1) Solicitudes Aprobadas (reutiliza el generador existente)
    if (types.includes('solicitudes-aprobadas')) {
      const buf = await solicitudReportService.generateApprovedSolicitudesWorkbook({
        frequency: params?.solicitudesAprobadas?.frequency || params?.frequency || 'monthly',
        from: params?.solicitudesAprobadas?.from || params?.from,
        to: params?.solicitudesAprobadas?.to || params?.to,
      });
      await appendSheetsFromBuffer(wb, buf);
    }

    // 2) Cartera actual
    if (types.includes('cartera-actual')) {
      const data = await reportesService.getCarteraActual();
      const ws = wb.addWorksheet('Cartera Actual');
      ws.columns = [
        { header: 'Estado', key: 'estado', width: 20 },
        { header: 'Producto', key: 'producto', width: 20 },
        { header: 'Total Préstamos', key: 'totalPrestamos', width: 16 },
        { header: 'Monto Total', key: 'montoTotal', width: 16 },
        { header: 'Saldo Total', key: 'saldoTotal', width: 16 },
      ];
      (data.detalle || []).forEach(g => {
        ws.addRow({
          estado: g.estado || '',
          producto: g.producto || '',
          totalPrestamos: g.totalPrestamos || 0,
          montoTotal: g.montoTotal || 0,
          saldoTotal: g.saldoTotal || 0,
        });
      });
      ws.getRow(1).font = { bold: true };
    }

    // 3) Mora
    if (types.includes('mora')) {
      const dias = params?.mora?.dias ?? params?.dias ?? 30;
      const data = await reportesService.getMoraPorDias(dias);
      const ws = wb.addWorksheet(`Mora ${dias}d`);
      ws.columns = [
        { header: 'Cliente', key: 'cliente', width: 30 },
        { header: 'Código', key: 'codigo', width: 20 },
        { header: 'Capital Inicial', key: 'capitalInicial', width: 16 },
        { header: 'Saldo Capital', key: 'saldoCapital', width: 16 },
        { header: 'Días Mora', key: 'diasMora', width: 12 },
      ];
      (data.detalle || []).forEach(f => {
        ws.addRow({
          cliente: f.clienteNombre || f.clienteId || '',
          codigo: f.codigo || f.codigoFinanciamiento || '',
          capitalInicial: f.capitalInicial || 0,
          saldoCapital: f.saldoCapital || 0,
          diasMora: f.diasMora || '',
        });
      });
      ws.getRow(1).font = { bold: true };
    }

    // 4) Colocación mensual
    if (types.includes('colocacion-mensual')) {
      const desde = params?.colocacionMensual?.desde ?? params?.desde;
      const hasta = params?.colocacionMensual?.hasta ?? params?.hasta;
      const data = await reportesService.getColocacionMensual(desde, hasta);
      const ws = wb.addWorksheet('Colocación Mensual');
      ws.columns = [
        { header: 'Periodo (YYYY-MM)', key: 'periodo', width: 16 },
        { header: 'Cantidad', key: 'cantidad', width: 12 },
        { header: 'Monto', key: 'monto', width: 14 },
      ];
      (data.series || []).forEach(r => {
        ws.addRow({
          periodo: r.periodo || r.mes || '',
          cantidad: r.cantidad || 0,
          monto: r.monto || 0,
        });
      });
      ws.getRow(1).font = { bold: true };
    }

    return wb.xlsx.writeBuffer();
  },
};