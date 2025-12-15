import express from "express";
import { userController } from "../controllers/user.controller.js";

const empleadosRouter = express.Router();

empleadosRouter.post("/register", userController.register);
empleadosRouter.post("/login", userController.login);
empleadosRouter.put("/:uid", userController.updateByUid);
empleadosRouter.get("/", userController.getAll);
empleadosRouter.delete("/codigo/:codigoUsuario", userController.deleteByCodigoUsuario);

export default empleadosRouter;
