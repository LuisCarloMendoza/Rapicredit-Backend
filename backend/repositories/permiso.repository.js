import permisoModel from "../models/permiso.model.js";

export const permisoRepository = {
  createPermiso: async (permisoData) => {
    const newPermiso = new permisoModel(permisoData);
    return await newPermiso.save();
  },

  findByCodigoPermiso: async (codigoPermiso) => {
    return await permisoModel.findOne({ codigoPermiso });
  },

  updatePermisoByCodigo: async (codigoPermiso, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'codigoPermiso')) {
      delete updateData.codigoPermiso;
    }
    return await permisoModel.findOneAndUpdate(
      { codigoPermiso },
      updateData,
      { new: true, runValidators: true }
    );
  },

  findAllPermisos: async () => {
    return await permisoModel.find();
  },
};
import User from '../models/permiso.model.js';

