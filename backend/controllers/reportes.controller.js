import { reportesService } from "../services/reportes.service.js";

export const reportesController = {
  // GET /api/reportes/cartera-actual
  getCarteraActual: async (req, res) => {
    try {
      const data = await reportesService.getCarteraActual();
      res.status(200).json(data);
    } catch (error) {
      console.error("Error en getCarteraActual:", error);
      res.status(500).json({ message: "Error al obtener reporte de cartera actual" });
    }
  },

  // GET /api/reportes/mora?dias=30
  getMora: async (req, res) => {
    try {
      const dias = req.query.dias ? parseInt(req.query.dias) : 30;
      const data = await reportesService.getMoraPorDias(dias);
      res.status(200).json(data);
    } catch (error) {
      console.error("Error en getMora:", error);
      res.status(500).json({ message: "Error al obtener reporte de mora" });
    }
  },

  // GET /api/reportes/colocacion-mensual?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
  getColocacionMensual: async (req, res) => {
    try {
      const { desde, hasta } = req.query;
      const data = await reportesService.getColocacionMensual(desde, hasta);
      res.status(200).json(data);
    } catch (error) {
      console.error("Error en getColocacionMensual:", error);
      res.status(500).json({ message: "Error al obtener reporte de colocación mensual" });
    }
  },
};
