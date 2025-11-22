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

  createUser: async ({ codigoUsuario, email, password }) => {
    //TODO Validaciones pa que truene antes de crear en mongo
    //Falta en Mongo Crear los permisos

    const existingByCodigo = await userRepository.findByCodigoUsuario(
      codigoUsuario
    );
    if (existingByCodigo) {
      throw new Error("A user with this codigoUsuario already exists.");
    }
    const existingByEmail = await userRepository.findByEmail(email);
    if (existingByEmail) {
      throw new Error("A user with this email already exists.");
    }

    let firebaseUser;
    try {
      firebaseUser = await admin.auth().createUser({
        email,
        password,
      });
    } catch (error) {
      throw new Error(`Firebase error: ${error.message}`);
    }

    const uid = firebaseUser.uid;
    let displayName;
    const newUserData = {
      uid,
      codigoUsuario,
      usuario: displayName || codigoUsuario,
      nombreCompleto: displayName || codigoUsuario,
      rol: "usuario",
      actividad: true,
      email,
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
