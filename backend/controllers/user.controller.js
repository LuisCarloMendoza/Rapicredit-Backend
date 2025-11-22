import { userService } from "../services/user.service.js";

export const userController = {
  register: async (req, res) => {
    try {
      const { codigoUsuario, email, password } = req.body;
      const newUser = await userService.createUser({
        codigoUsuario,
        email,
        password,
      });
      res.status(201).json(newUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  login: async (req, res) => {
    try {
      const firebaseUser = req.body.email;
      const password = req.body.password;
      const user = await userService.loginByFirebaseUser(firebaseUser, password);
      res.status(200).json(user);
    } catch (error) {
      res.status(401).json({ message: error.message });
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
};
