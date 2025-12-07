import { dashboardService } from "../services/dashboard.service.js";

export const dashboardController = {
  getResumen: async (req, res) => {
    try {
      const resumen = await dashboardService.getResumenDashboard();
      res.json(resumen);
    } catch (error) {
      console.error("Error en getResumenDashboard:", error);
      res.status(500).json({
        message: "Error al obtener el resumen del dashboard",
      });
    }
  },
};

