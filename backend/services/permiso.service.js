import { permisoRepository } from "../repositories/permiso.repository.js";

export const permisoService = {
  _validateCreateData: (data) => {
    const required = ['codigoPermiso', 'permiso'];
    const missing = [];
    for (const key of required) {
      if (data[key] === undefined || data[key] === null) missing.push(key);
    }
    if (missing.length) throw new Error(`Missing required fields: ${missing.join(', ')}`);

    if (data.acesso !== undefined && !['APP', 'WEB', 'BOTH'].includes(data.acesso)) {
      throw new Error('Invalid acesso value (allowed: APP, WEB, BOTH)');
    }
  },

  _validateUpdateData: (updateData) => {
    if (!updateData || typeof updateData !== 'object') throw new Error('Invalid update payload');
    if (Object.prototype.hasOwnProperty.call(updateData, 'codigoPermiso')) {
      throw new Error('codigoPermiso cannot be updated');
    }
    if (updateData.acesso !== undefined && !['APP', 'WEB', 'BOTH'].includes(updateData.acesso)) {
      throw new Error('Invalid acesso value (allowed: APP, WEB, BOTH)');
    }
  },

  createPermiso: async (permisoData) => {
    permisoService._validateCreateData(permisoData);
    const existing = await permisoRepository.findByCodigoPermiso(permisoData.codigoPermiso);
    if (existing) throw new Error('A permiso with this codigoPermiso already exists.');
    const newPermiso = await permisoRepository.createPermiso(permisoData);
    return newPermiso;
  },

  updatePermisoByCodigo: async (codigoPermiso, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'codigoPermiso')) {
      delete updateData.codigoPermiso;
    }
    permisoService._validateUpdateData(updateData);
    const existing = await permisoRepository.findByCodigoPermiso(codigoPermiso);
    if (!existing) throw new Error('Permiso with the provided codigoPermiso does not exist.');
    const updated = await permisoRepository.updatePermisoByCodigo(codigoPermiso, updateData);
    return updated;
  },

  getAllPermisos: async () => {
    return await permisoRepository.findAllPermisos();
  },

  getPermisoByCodigo: async (codigoPermiso) => {
    const permiso = await permisoRepository.findByCodigoPermiso(codigoPermiso);
    if (!permiso) throw new Error('Permiso with the provided codigoPermiso does not exist.');
    return permiso;
  }
};
