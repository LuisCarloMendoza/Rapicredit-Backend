import { userRepository } from "../repositories/user.repository.js";
import admin from "firebase-admin";

export const userService = {
  getUserByUid: async (uid) => {
    return await userRepository.findByUid(uid);
  },

  loginByFirebaseUser: async (firebaseUser) => {
    const { uid } = firebaseUser;
    if (!uid) {
      throw new Error("UID is required for login");
    }
    let user = await userRepository.findByUid(uid);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  },

  // Credential-based login: identifier may be { usuario } or { email }
  loginWithCredentials: async ({ usuario, email, password }) => {
    if (!password) throw new Error('Password is required');

    let user = null;
    if (usuario) {
      user = await userRepository.findByUsuario(usuario);
    } else if (email) {
      user = await userRepository.findByEmail(email);
    }

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // NOTE: current implementation stores `contraseña` plainly. Compare directly.
    // Consider hashing passwords in the future.
    if (user.contraseña !== password) {
      throw new Error('Invalid credentials');
    }

    return user;
  },

  createUser: async (userData) => {
    // Expected fields: codigoUsuario, email, password, usuario, nombreCompleto, telefono
    if (!userData || typeof userData !== 'object') throw new Error('Invalid registration payload');

    const { codigoUsuario, email, password, usuario, nombreCompleto, telefono, rol, permisos, actividad } = userData;

    const required = ['codigoUsuario', 'email', 'password', 'usuario', 'nombreCompleto', 'telefono', 'rol'];
    const missing = [];
    for (const key of required) {
      if (userData[key] === undefined || userData[key] === null || userData[key] === '') missing.push(key);
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

    const existingByCodigo = await userRepository.findByCodigoUsuario(codigoUsuario);
    if (existingByCodigo) {
      throw new Error('A user with this codigoUsuario already exists.');
    }
    const existingByEmail = await userRepository.findByEmail(email);
    if (existingByEmail) {
      throw new Error('A user with this email already exists.');
    }

    let firebaseUser;
    try {
      // create firebase user with email + password; include displayName and phoneNumber when available
      const createPayload = { email, password };
      if (usuario) createPayload.displayName = usuario;
      if (telefono) createPayload.phoneNumber = telefono;
      firebaseUser = await admin.auth().createUser(createPayload);
    } catch (error) {
      throw new Error(`Firebase error: ${error.message}`);
    }

    const uid = firebaseUser.uid;

    // Ensure no duplicate by uid exists in Mongo
    const existingByUid = await userRepository.findByUid(uid);
    if (existingByUid) throw new Error('A user with this UID already exists in the database.');

    const newUserData = {
      uid,
      codigoUsuario,
      usuario: usuario || codigoUsuario,
      nombreCompleto: nombreCompleto || usuario || codigoUsuario,
      rol: rol.toLowerCase(),
      actividad: (typeof actividad === 'boolean') ? actividad : true,
      email,
      telefono,
      permisos: Array.isArray(permisos) ? permisos : [],
      // store contraseña in the field required by schema; using plain password here (consider hashing in future)
      contraseña: password,
    };

    const newUser = await userRepository.createUser(newUserData);
    return newUser;
  },

  updateUserByUid: async (uid, updateData) => {
    if(!uid){
      throw new Error("UID is required for updating user");
    }
    const existe = await userRepository.findByUid(uid);
    if(!existe){
      throw new Error("User with the provided UID does not exist");
    }
    const updatedUser = await userRepository.updateUserByUid(uid, updateData);
    return updatedUser;
  },


  updateUserByCodigoUsuario: async (codigoUsuario, updateData) => {
    if (!codigoUsuario) {
      throw new Error("codigoUsuario is required for updating user");
    }
    const existe = await userRepository.findByCodigoUsuario(codigoUsuario);
    if (!existe) {
      throw new Error("User with the provided codigoUsuario does not exist");
    }
    const updatedUser = await userRepository.updateUserByCodigoUsuario(
      codigoUsuario,
      updateData
    );
    return updatedUser;
  },
};
