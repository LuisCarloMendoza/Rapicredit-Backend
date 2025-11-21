import { userRepository } from "../repositories/user.repository";
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

  createUser: async ({ codigoUsuario, email, displayName, password }) => {
    const existingUser = await userRepository.findByCodigoUsuario(
      codigoUsuario
    );
    if (existingUser) {
      throw new Error("A user with this codigoUsuario already exists.");
    }

    let firebaseUser;
    try {
      firebaseUser = await admin.auth().createUser({
        email,
        password,
        displayName,
      });
    } catch (error) {
      throw new Error(`Firebase error: ${error.message}`);
    }

    const uid = firebaseUser.uid;

    const newUserData = {
      uid,
      email,
      codigoUsuario,
      usuario: displayName,
      rol: "usuario",
      actividad: true,
    };

    const newUser = await userRepository.createUser(newUserData);
    return newUser;
  },
};
