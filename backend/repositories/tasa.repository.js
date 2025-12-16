import TasaInteres from '../models/tasa.model.js';

export const tasaRepository = {
  // Crear tasa de interés
  createTasa: async (data) => {
    const entity = new TasaInteres(data);
    return await entity.save();
  },

  // Buscar tasa por nombre
  findByNombre: async (nombre) => {
    return await TasaInteres.findOne({ nombre, activa: true });
  },

  // Buscar tasa por código
  findByCodigo: async (codigoTasa) => {
    return await TasaInteres.findOne({ codigoTasa, activa: true });
  },

  // Buscar tasa por ID (y devolver solo porcentajeInteres)
  findById: async (id) => {
    const tasa = await TasaInteres.findOne({ _id: id, activa: true });
    if (!tasa) throw new Error("Tasa de interés no encontrada");
    return tasa.porcentajeInteres;  // Solo devolvemos el porcentaje de la tasa
  },

  // Obtener todas las tasas activas
  findAll: async () => {
    return await TasaInteres.find({ activa: true });
  },

  // Actualizar tasa por nombre
  updateByNombre: async (nombre, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'nombre')) {
      delete updateData.nombre;
    }
    return await TasaInteres.findOneAndUpdate({ nombre }, updateData, { new: true, runValidators: true });
  },

  // Actualizar tasa por código
  updateByCodigo: async (codigoTasa, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'codigoTasa')) delete updateData.codigoTasa;
    return await TasaInteres.findOneAndUpdate({ codigoTasa }, updateData, { new: true, runValidators: true });
  },

  // Actualizar tasa por ID
  updateById: async (id, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'nombre')) {
      delete updateData.nombre;
    }
    return await TasaInteres.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  },

  // Eliminar tasa por código
  deleteByCodigo: async (codigoTasa) => {
    return await TasaInteres.findOneAndUpdate(
      { codigoTasa },
      { activa: false },
      { new: true }
    );
  }
};
