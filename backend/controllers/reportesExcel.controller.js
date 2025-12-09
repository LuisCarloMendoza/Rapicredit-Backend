import { reportesExcelService } from '../services/reportesExcel.service.js';

const parseTypes = (raw) => {
  const ALL = ['solicitudes-aprobadas', 'cartera-actual', 'mora', 'colocacion-mensual'];
  if (!raw || raw.trim() === '' || raw.trim().toLowerCase() === 'all') return ALL;
  return raw
    .split(',')
    .map(t => t.trim().toLowerCase())
    .filter(Boolean)
    .filter(t => ALL.includes(t));
};

export const reportesExcelController = {
  getExcel: async (req, res) => {
    try {
      const types = parseTypes(req.query.types);

      const params = {
        from: req.query.from,
        to: req.query.to,
        frequency: req.query.frequency,
        dias: req.query.dias ? parseInt(req.query.dias) : undefined,
        desde: req.query.desde,
        hasta: req.query.hasta,
        solicitudesAprobadas: {
          from: req.query.from,
          to: req.query.to,
          frequency: req.query.frequency || 'monthly',
        },
        mora: {
          dias: req.query.dias ? parseInt(req.query.dias) : 30,
        },
        colocacionMensual: {
          desde: req.query.desde,
          hasta: req.query.hasta,
        },
      };

      const buffer = await reportesExcelService.generate({ types, params });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="reportes.xlsx"');
      return res.status(200).send(buffer);
    } catch (err) {
      console.error('Error generando Excel:', err);
      return res.status(500).json({ message: 'Error al generar Excel' });
    }
  },
};