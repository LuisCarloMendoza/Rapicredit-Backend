import { empleadoRepository } from "../repositories/empleado.repository.js";
import admin from "firebase-admin";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;


export const empleadoService = {
  getEmpleadoByUid: async (uid) => {
    return await empleadoRepository.findByUid(uid);
  },

  loginByFirebaseEmpleado: async (firebaseUser) => {
    const { uid } = firebaseUser;
    if (!uid) {
      throw new Error("UID is required for login");
    }
    let empleado = await empleadoRepository.findByUid(uid);
    if (!empleado) {
      throw new Error("Empleado not found");
    }
    const passwordMatch = await bcrypt.compare(password, empleado.password);
    if (!passwordMatch) {
      throw new Error('Invalid credentials');
    }
    return empleado;
  },

  // Credential-based login: identifier may be { usuario } or { email }
  loginWithCredentials: async ({ usuario, email, password }) => {
    if (!password) throw new Error('Password is required');

    let empleado = null;
    if (usuario) {
      empleado = await empleadoRepository.findByUsuario(usuario);
    } else if (email) {
      empleado = await empleadoRepository.findByEmail(email);
    }

    if (!empleado) {
      throw new Error('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(password, empleado.password);
    if (!passwordMatch) {
      throw new Error('Invalid credentials');
    }

    return empleado;
  },

  createEmpleado: async (empleadoData) => {
    // Expected fields: codigoUsuario, email, password, usuario, nombreCompleto, telefono
    if (!empleadoData || typeof empleadoData !== 'object') throw new Error('Invalid registration payload');

    const { codigoUsuario, email, password, usuario, nombreCompleto, telefono, rol, permisos, estado } = empleadoData;

    const required = ['codigoUsuario', 'email', 'password', 'usuario', 'nombreCompleto', 'telefono', 'rol'];
    const missing = [];
    for (const key of required) {
      if (empleadoData[key] === undefined || empleadoData[key] === null || empleadoData[key] === '') missing.push(key);
    }
    if (missing.length) throw new Error(`Missing required fields: ${missing.join(', ')}`);

    // Basic email validation
    if (typeof email !== 'string' || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      throw new Error('Invalid email format');
    }

    // telefono should be a string
    if (typeof telefono !== 'string' || telefono.trim() === '') {
      throw new Error('telefono must be a non-empty string');
    }

    // rol validation: only allowed values
    if (typeof rol !== 'string' || !['gerente', 'supervisor', 'asesor'].includes(rol.toLowerCase())) {
      throw new Error("Invalid rol value. Allowed values: gerente, supervisor, asesor");
    }

    const existingByCodigo = await empleadoRepository.findByCodigoUsuario(codigoUsuario);
    if (existingByCodigo) {
      throw new Error('An empleado with this codigoUsuario already exists.');
    }
    const existingByEmail = await empleadoRepository.findByEmail(email);
    if (existingByEmail) {
      throw new Error('An empleado with this email already exists.');
    }

    let firebaseUser;
    try {
      // create firebase empleado with email + password; include displayName and phoneNumber when available
      const createPayload = { email, password };
      if (usuario) createPayload.displayName = usuario;
      if (telefono) createPayload.phoneNumber = telefono;
      firebaseUser = await admin.auth().createUser(createPayload);
    } catch (error) {
      throw new Error(`Firebase error: ${error.message}`);
    }

    const uid = firebaseUser.uid;

    // Ensure no duplicate by uid exists in Mongo
    const existingByUid = await empleadoRepository.findByUid(uid);
    if (existingByUid) throw new Error('An empleado with this UID already exists in the database.');

    const newEmpleadoData = {
      uid,
      codigoUsuario,
      usuario: usuario || codigoUsuario,
      nombreCompleto: nombreCompleto || usuario || codigoUsuario,
      rol: rol.toLowerCase(),
      estado: (typeof estado === 'boolean') ? estado : true,
      email,
      telefono,
      permisos: Array.isArray(permisos) ? permisos : [],
      // store password in the field required by schema
      password: await bcrypt.hash(password, SALT_ROUNDS),
    };
    
    const newEmpleado = await empleadoRepository.createEmpleado(newEmpleadoData);
    return newEmpleado;
  },

  updateEmpleadoByUid: async (uid, updateData) => {
    if(!uid){
      throw new Error("UID is required for updating empleado");
    }
    const existe = await empleadoRepository.findByUid(uid);
    if(!existe){
      throw new Error("Empleado with the provided UID does not exist");
    }
    const updatedEmpleado = await empleadoRepository.updateEmpleadoByUid(uid, updateData);
    return updatedEmpleado;
  },


  updateEmpleadoByCodigoUsuario: async (codigoUsuario, updateData) => {
    if (!codigoUsuario) {
      throw new Error("codigoUsuario is required for updating empleado");
    }
    const existe = await empleadoRepository.findByCodigoUsuario(codigoUsuario);
    if (!existe) {
      throw new Error("Empleado with the provided codigoUsuario does not exist");
    }
    const updatedEmpleado = await empleadoRepository.updateEmpleadoByCodigoUsuario(
      codigoUsuario,
      updateData
    );
    return updatedEmpleado;
  },

  deleteByCodigoUsuario: async (codigoUsuario) => {
    if (!codigoUsuario) {
      throw new Error("codigoUsuario is required for deleting empleado");
    }
    const existe = await empleadoRepository.findByCodigoUsuario(codigoUsuario);
    if (!existe) {
      throw new Error("Empleado with the provided codigoUsuario does not exist");
    }
    return await empleadoRepository.deleteByCodigoUsuario(codigoUsuario);
  },

  // Toggle estado por codigoUsuario (true->false, false->true)
  toggleEstadoByCodigoUsuario: async (codigoUsuario) => {
    if (!codigoUsuario) {
      throw new Error("codigoUsuario is required for toggling estado");
    }
    const existente = await empleadoRepository.findByCodigoUsuario(codigoUsuario);
    if (!existente) {
      throw new Error("Empleado with the provided codigoUsuario does not exist");
    }
    const nuevoEstado = existente.estado !== true; // true->false, false/undefined->true
    const updated = await empleadoRepository.updateEmpleadoByCodigoUsuario(codigoUsuario, { estado: nuevoEstado });
    return updated;
  },
  
  // Listado ligero de empleados activos con campos básicos
  getCodigos: async () => {
    // Ahora devuelve activos e inactivos e incluye estado
    const docs = await empleadoRepository.findLiteAll();
    // Devolver como objetos planos con solo los campos requeridos
    return docs.map(d => ({
      codigoUsuario: d.codigoUsuario,
      nombreCompleto: d.nombreCompleto,
      rol: d.rol,
      usuario: d.usuario,
      email: d.email,
      telefono: d.telefono,
      estado: d.estado
    }));
  }
};
