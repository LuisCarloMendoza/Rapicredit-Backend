import { userService } from "../services/user.service.js";
import admin from "firebase-admin";
import User from '../models/user.model.js';

export const userController = {
  register: async (req, res) => {
    try {
      // forward full registration payload to service (service will validate required fields)
      const newUser = await userService.createUser(req.body);
      res.status(201).json(newUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Login accepts either:
  // 1) Authorization: Bearer <firebaseIdToken> header -> verify token and fetch by uid
  // 2) Body with { usuario, password } OR { email, password } -> credential login
  login: async (req, res) => {
    try {
      // If Authorization header present, try token flow
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        const decoded = await admin.auth().verifyIdToken(token);
        if (!decoded || !decoded.uid) {
          return res.status(401).json({ message: "Invalid token" });
        }
        const user = await userService.getUserByUid(decoded.uid);
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.status(200).json(user);
      }

      // Credential flow
      const { usuario, email, password } = req.body;
      if ((!usuario && !email) || !password) {
        return res.status(400).json({ message: "Provide usuario or email and password" });
      }

      const user = await userService.loginWithCredentials({ usuario, email, password });
      return res.status(200).json(user);
    } catch (error) {
      return res.status(401).json({ message: error.message });
    }
  },

  updateByUid: async (req, res) => {
    try {
      const uid = req.params.uid;
      const updateData = req.body;
      const updatedUser = await userService.updateUserByUid(uid, updateData);
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  updateByCodigoUsuario: async (req, res) => {
    try {
      const codigoUsuario = req.params.codigoUsuario;
      const updateData = req.body;
      const updatedUser = await userService.updateUserByCodigoUsuario(codigoUsuario, updateData);
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const users = await User.find({ actividad: true }).select("-contrasea");
      res.status(200).json({
        ok: true,
        total: users.length,
        users,
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        msg: "Error al obtener los usuarios",
        error: error.message,
      });
    }
  },

  deleteByCodigoUsuario: async (req, res) => {
    try {
      const { codigoUsuario } = req.params;
      await userService.deleteByCodigoUsuario(codigoUsuario);
      res.status(204).end();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};
