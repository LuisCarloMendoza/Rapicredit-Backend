import { permisoService } from "../services/permiso.service.js";

export const permisoController = {
  createPermiso: async (req, res) => {
    try {
      const permisoData = req.body;
      const newPermiso = await permisoService.createPermiso(permisoData);
      res.status(201).json(newPermiso);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  updatePermisoByCodigo: async (req, res) => {
    try {
      const codigoPermiso = req.params.codigoPermiso;
      const updateData = req.body;
      const updatedPermiso = await permisoService.updatePermisoByCodigo(codigoPermiso, updateData);
      res.status(200).json(updatedPermiso);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getAllPermisos: async (req, res) => {
    try {
      const permisos = await permisoService.getAllPermisos();
      res.status(200).json(permisos);
    } catch (error) {
      res.status(403).json({ message: error.message });
    }
  },

  getPermisoByCodigo: async (req, res) => {
    try {
      const codigoPermiso = req.params.codigoPermiso;
      const permiso = await permisoService.getPermisoByCodigo(codigoPermiso);
      res.status(200).json(permiso);
    } catch (error) {
      res.status(403).json({ message: error.message });
    }
  },
};
