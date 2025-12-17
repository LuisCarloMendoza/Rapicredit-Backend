import TasaInteres from '../models/tasa.model.js';

export const tasaRepository = {
  // Crear tasa de interés
  createTasa: async (data) => {
    const entity = new TasaInteres(data);
    return await entity.save();
  },

  // Buscar tasa por nombre (vigentes)
  findByNombre: async (nombre) => {
    return await TasaInteres.findOne({ nombre, vigente: true });
  },

  // Buscar por codigoTasa (incluye vigentes e inactivas)
  findByCodigoTasa: async (codigoTasa) => {
    return await TasaInteres.findOne({ codigoTasa });
  },

  // Buscar tasa por ID (y devolver solo tasaAnual)
  findById: async (id) => {
    const tasa = await TasaInteres.findOne({ _id: id, vigente: true });
    if (!tasa) throw new Error("Tasa de interés no encontrada");
    return tasa.tasaAnual;  // Solo devolvemos el porcentaje anual
  },

  // Obtener todas las tasas vigentes
  findAll: async () => {
    return await TasaInteres.find({ vigente: true });
  },

  // Obtener todas las tasas (activas e inactivas)
  findAllAll: async () => {
    return await TasaInteres.find({});
  },

  // Actualizar tasa por nombre
  updateByNombre: async (nombre, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'nombre')) {
      delete updateData.nombre;
    }
    return await TasaInteres.findOneAndUpdate({ nombre }, updateData, { new: true, runValidators: true });
  },

  // Actualizar tasa por ID
  updateById: async (id, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'nombre')) {
      delete updateData.nombre;
    }
    return await TasaInteres.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  },

  // Actualizar tasa por codigoTasa
  updateByCodigoTasa: async (codigoTasa, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'nombre')) {
      delete updateData.nombre;
    }
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'codigoTasa')) {
      delete updateData.codigoTasa;
    }
    return await TasaInteres.findOneAndUpdate({ codigoTasa }, updateData, { new: true, runValidators: true });
  },

  // Toggle vigente por codigoTasa
  toggleVigenteByCodigoTasa: async (codigoTasa) => {
    const doc = await TasaInteres.findOne({ codigoTasa });
    if (!doc) return null;
    const nuevoVigente = doc.vigente !== true;
    return await TasaInteres.findOneAndUpdate(
      { codigoTasa },
      { vigente: nuevoVigente },
      { new: true, runValidators: true }
    );
  },

  // Listado ligero: campos básicos + vigente
  findLiteAll: async () => {
    return await TasaInteres.find({})
      .select('codigoTasa nombre tasaAnual tasaMora vigente');
  }
};
