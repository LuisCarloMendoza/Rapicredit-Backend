import { clienteRepository } from "../repositories/cliente.repository.js";
import { financiamientoRepository } from "../repositories/financiamiento.repository.js";
import { abonoRepository } from "../repositories/abono.repository.js";

export const clienteService = {
  // --- Validation helpers ---
  _isValidEmail: (email) => {
    if (typeof email !== 'string') return false;
    // simple email regex
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  },

  _isValidDate: (d) => {
    if (d === null || d === undefined || d === '') return false;
    const date = new Date(d);
    return !Number.isNaN(date.getTime());
  },

  _validateCreateData: (data) => {
    const required = [
      'codigoCliente', 'identidadCliente', 'nacionalidad', 'RTN', 'estadoCivil',
      'nivelEducativo', 'tipoVivienda', 'antiguedadVivenda', 'numerosDependientes',
      'listadoDependientes', 'edadDependientes', 'zonaResidencialCliente', 'nombre',
      'apellido', 'email', 'telefono', 'direccion', 'sexo', 'fechaNacimiento',
      'frecuenciaPago', 'estadoDeuda'
    ];
    const missing = [];
    for (const key of required) {
      if (data[key] === undefined || data[key] === null) missing.push(key);
    }
    if (missing.length) throw new Error(`Missing required fields: ${missing.join(', ')}`);

    if (!clienteService._isValidEmail(data.email)) throw new Error('Invalid email format');
    if (!clienteService._isValidDate(data.fechaNacimiento)) throw new Error('Invalid fechaNacimiento (expected date)');
    if (!Array.isArray(data.telefono) || data.telefono.length === 0) throw new Error('telefono must be a non-empty array of strings');
    if (!Array.isArray(data.numerosDependientes)) throw new Error('numerosDependientes must be an array of numbers');
    if (!Array.isArray(data.listadoDependientes)) throw new Error('listadoDependientes must be an array of strings');
    if (!Array.isArray(data.edadDependientes)) throw new Error('edadDependientes must be an array of numbers');
    if (typeof data.antiguedadVivenda !== 'number') throw new Error('antiguedadVivenda must be a number');
    if (data.limiteCredito !== undefined && typeof data.limiteCredito !== 'number') throw new Error('limiteCredito must be a number');
    if (data.tasaCliente !== undefined && typeof data.tasaCliente !== 'number') throw new Error('tasaCliente must be a number');
  },

  _validateUpdateData: (updateData) => {
    if (!updateData || typeof updateData !== 'object') throw new Error('Invalid update payload');
    if (Object.prototype.hasOwnProperty.call(updateData, 'codigoCliente')) {
      throw new Error('codigoCliente cannot be updated');
    }
    if (updateData.email !== undefined && !clienteService._isValidEmail(updateData.email)) throw new Error('Invalid email format');
    if (updateData.fechaNacimiento !== undefined && !clienteService._isValidDate(updateData.fechaNacimiento)) throw new Error('Invalid fechaNacimiento (expected date)');
    if (updateData.telefono !== undefined && (!Array.isArray(updateData.telefono) || updateData.telefono.length === 0)) throw new Error('telefono must be a non-empty array of strings');
    if (updateData.numerosDependientes !== undefined && !Array.isArray(updateData.numerosDependientes)) throw new Error('numerosDependientes must be an array of numbers');
    if (updateData.listadoDependientes !== undefined && !Array.isArray(updateData.listadoDependientes)) throw new Error('listadoDependientes must be an array of strings');
    if (updateData.edadDependientes !== undefined && !Array.isArray(updateData.edadDependientes)) throw new Error('edadDependientes must be an array of numbers');
    if (updateData.antiguedadVivenda !== undefined && typeof updateData.antiguedadVivenda !== 'number') throw new Error('antiguedadVivenda must be a number');
    if (updateData.limiteCredito !== undefined && typeof updateData.limiteCredito !== 'number') throw new Error('limiteCredito must be a number');
    if (updateData.tasaCliente !== undefined && typeof updateData.tasaCliente !== 'number') throw new Error('tasaCliente must be a number');
  },

  createCliente: async (clienteData) => {
    // Validate payload
    clienteService._validateCreateData(clienteData);

    const existingCliente = await clienteRepository.findByCodigoCliente(clienteData.codigoCliente);
    if (existingCliente) {
      throw new Error("A cliente with this codigoCliente already exists.");
    }
    const newCliente = await clienteRepository.createCliente(clienteData);
    return newCliente;
  },

  updateClienteByCodigo: async (codigoCliente, updateData) => {
    // If the client accidentally includes codigoCliente in the payload, ignore it (don't fail)
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'codigoCliente')) {
      delete updateData.codigoCliente;
    }

    // Validate update payload (types and formats)
    clienteService._validateUpdateData(updateData);
    const existingCliente = await clienteRepository.findByCodigoCliente(codigoCliente);
    if (!existingCliente) {
      throw new Error("Cliente with the provided codigoCliente does not exist.");
    }
    const updatedCliente = await clienteRepository.updateClienteByCodigo(codigoCliente, updateData);
    return updatedCliente;
  },
  getAllClientes: async () => {
    const clientes = await clienteRepository.findAllClientes();
    return clientes;
  },

  getClienteByCodigo: async (codigoCliente) => {
    const cliente = await clienteRepository.findByCodigoCliente(codigoCliente);
    if (!cliente) {
      throw new Error("Cliente with the provided codigoCliente does not exist.");
    }
    return cliente;
  },

  // ==== NUEVO: resumen de clientes para el frontend ====
  getClientesResumen: async () => {
    // 1) Traemos todos los clientes activos (o todos, según tu lógica)
    const clientes = await clienteRepository.findAllClientes();

    if (!clientes || clientes.length === 0) {
      return [];
    }

    // Lista de IDs de clientes
    const clienteIds = clientes.map((c) => c._id);

    // 2) Traemos todos los financiamientos de esos clientes
    const financiamientos = await financiamientoRepository.findByClienteIds(clienteIds);

    // 3) Traemos todos los abonos de esos clientes (ordenados desc por fecha)
    const abonos = await abonoRepository.findByClienteIds(clienteIds);

    // Mapas para acumular info por cliente
    const mapaPrestamos = new Map();   // {clienteId: {activos, tieneMora}}
    const mapaUltimoAbono = new Map(); // {clienteId: fechaAbono}

    // Procesamos financiamientos
    for (const f of financiamientos) {
      const idCliente = String(f.clienteId);
      if (!mapaPrestamos.has(idCliente)) {
        mapaPrestamos.set(idCliente, { activos: 0, tieneMora: false });
      }
      const info = mapaPrestamos.get(idCliente);
      info.activos += 1;

      if (f.estadoFinanciamiento === 'EN_MORA') {
        info.tieneMora = true;
      }
    }

    // Procesamos abonos (como vienen ordenados desc, el primero que veamos es el último)
    for (const a of abonos) {
      const idCliente = String(a.clienteId);
      if (!mapaUltimoAbono.has(idCliente)) {
        mapaUltimoAbono.set(idCliente, a.fechaAbono);
      }
    }

    // Armamos el resumen final por cliente
    const resumen = clientes.map((c) => {
      const idCliente = String(c._id);

      const infoPrestamos = mapaPrestamos.get(idCliente) || {
        activos: 0,
        tieneMora: false,
      };

      const ultimoMovimiento = mapaUltimoAbono.get(idCliente) || null;

      return {
        cliente: c, // objeto cliente completo tal como viene de la BD
        prestamosActivos: infoPrestamos.activos,
        tieneMora: infoPrestamos.tieneMora,
        ultimoMovimiento,
      };
    });

    return resumen;
  },


  deleteClienteByCodigo: async (codigoCliente) => {
    if (!codigoCliente) throw new Error("codigoCliente is required for deleting cliente.");
    const existingCliente = await clienteRepository.findByCodigoCliente(codigoCliente);
    if (!existingCliente) {
      throw new Error("Cliente with the provided codigoCliente does not exist.");
    }
    await clienteRepository.deleteClienteByCodigo(codigoCliente);
    return { message: 'Cliente disabled successfully' };
  }
};
