import { tasaRepository } from '../repositories/tasa.repository.js';

const allowedFrecuencias = ['Diario','Semanal','Quincenal','Mensual'];

export const tasaService = {
  _validateCreateData: (data) => {
    const required = ['nombre', 'tasaAnual'];
    const missing = [];
    for (const key of required) {
      if (data[key] === undefined || data[key] === null || data[key] === '') missing.push(key);
    }
    if (missing.length) throw new Error(`Missing required fields: ${missing.join(', ')}`);

    if (typeof data.tasaAnual !== 'number') throw new Error('tasaAnual must be a number');
    if (data.tasaMora !== undefined && typeof data.tasaMora !== 'number') throw new Error('tasaMora must be a number');
    if (data.minimoCapital !== undefined && typeof data.minimoCapital !== 'number') throw new Error('minimoCapital must be a number');
    if (data.maximoCapital !== undefined && typeof data.maximoCapital !== 'number') throw new Error('maximoCapital must be a number');
    if (data.diasGracia !== undefined && typeof data.diasGracia !== 'number') throw new Error('diasGracia must be a number');
    if (data.solicitudRequerida !== undefined && typeof data.solicitudRequerida !== 'boolean') throw new Error('solicitudRequerida must be a boolean');
    if (data.vigente !== undefined && typeof data.vigente !== 'boolean') throw new Error('vigente must be a boolean');
    if (data.frecuenciaCobro !== undefined) {
      if (typeof data.frecuenciaCobro !== 'string' || !allowedFrecuencias.includes(data.frecuenciaCobro)) {
        throw new Error(`frecuenciaCobro must be one of: ${allowedFrecuencias.join(', ')}`);
      }
    }
    if (data.vigenciaDesde && data.vigenciaHasta) {
      const desde = new Date(data.vigenciaDesde);
      const hasta = new Date(data.vigenciaHasta);
      if (!isFinite(desde.getTime()) || !isFinite(hasta.getTime())) throw new Error('Invalid vigencia dates');
      if (hasta < desde) throw new Error('vigenciaHasta must be after vigenciaDesde');
    }
  },

  _validateUpdateData: (updateData) => {
    if (!updateData || typeof updateData !== 'object') throw new Error('Invalid update payload');
    if (Object.prototype.hasOwnProperty.call(updateData, 'nombre')) throw new Error('nombre cannot be updated');

    if (updateData.tasaAnual !== undefined && typeof updateData.tasaAnual !== 'number') throw new Error('tasaAnual must be a number');
    if (updateData.tasaMora !== undefined && typeof updateData.tasaMora !== 'number') throw new Error('tasaMora must be a number');
    if (updateData.minimoCapital !== undefined && typeof updateData.minimoCapital !== 'number') throw new Error('minimoCapital must be a number');
    if (updateData.maximoCapital !== undefined && typeof updateData.maximoCapital !== 'number') throw new Error('maximoCapital must be a number');
    if (updateData.diasGracia !== undefined && typeof updateData.diasGracia !== 'number') throw new Error('diasGracia must be a number');
    if (updateData.solicitudRequerida !== undefined && typeof updateData.solicitudRequerida !== 'boolean') throw new Error('solicitudRequerida must be a boolean');
    if (updateData.vigente !== undefined && typeof updateData.vigente !== 'boolean') throw new Error('vigente must be a boolean');
    if (updateData.frecuenciaCobro !== undefined) {
      if (typeof updateData.frecuenciaCobro !== 'string' || !allowedFrecuencias.includes(updateData.frecuenciaCobro)) {
        throw new Error(`frecuenciaCobro must be one of: ${allowedFrecuencias.join(', ')}`);
      }
    }
    if (updateData.vigenciaDesde && updateData.vigenciaHasta) {
      const desde = new Date(updateData.vigenciaDesde);
      const hasta = new Date(updateData.vigenciaHasta);
      if (!isFinite(desde.getTime()) || !isFinite(hasta.getTime())) throw new Error('Invalid vigencia dates');
      if (hasta < desde) throw new Error('vigenciaHasta must be after vigenciaDesde');
    }
  },

  createTasa: async (data) => {
    tasaService._validateCreateData(data);
    const existingByNombre = await tasaRepository.findByNombre(data.nombre);
    if (existingByNombre) throw new Error('A tasa with this nombre already exists.');
    // Generar codigoTasa secuencial tipo TF-00001 (reutiliza huecos entre vigentes)
    const vigentes = await tasaRepository.findAll();
    const nums = new Set(
      (vigentes || [])
        .map(t => {
          const m = typeof t.codigoTasa === 'string' ? t.codigoTasa.match(/^TF-(\d{5})$/) : null;
          return m ? parseInt(m[1], 10) : null;
        })
        .filter(n => typeof n === 'number' && !isNaN(n))
    );
    let next = 1;
    while (nums.has(next)) next++;
    const codigoTasa = `TF-${String(next).padStart(5, '0')}`;
    const payload = { ...data, codigoTasa };
    return await tasaRepository.createTasa(payload);
  },

  updateByNombre: async (nombre, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'nombre')) delete updateData.nombre;
    tasaService._validateUpdateData(updateData);
    const existing = await tasaRepository.findByNombre(nombre);
    if (!existing) throw new Error('Tasa with the provided nombre does not exist.');
    return await tasaRepository.updateByNombre(nombre, updateData);
  },

  updateById: async (id, updateData) => {
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'nombre')) delete updateData.nombre;
    tasaService._validateUpdateData(updateData);
    // Validar existencia mediante listado, porque repo.findById devuelve solo el número
    // de tasaAnual cuando está vigente; por eso verificamos que el id exista primero.
    const list = await tasaRepository.findAll();
    const exists = list.find(t => String(t._id) === String(id));
    if (!exists) throw new Error('Tasa with the provided id does not exist.');
    return await tasaRepository.updateById(id, updateData);
  },

  getAll: async () => {
    return await tasaRepository.findAll();
  },

  getByNombre: async (nombre) => {
    const item = await tasaRepository.findByNombre(nombre);
    if (!item) throw new Error('Tasa with the provided nombre does not exist.');
    return item;
  },

  getById: async (id) => {
    const item = await tasaRepository.findById(id);
    if (!item && item !== 0) throw new Error('Tasa with the provided id does not exist.');
    return item;
  }
};
