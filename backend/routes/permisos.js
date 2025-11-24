import express from "express";
import { permisoController } from "../controllers/permiso.controller.js";

const permisoRouter = express.Router();

permisoRouter.post("/", permisoController.createPermiso);
permisoRouter.put("/:codigoPermiso", permisoController.updatePermisoByCodigo);
permisoRouter.get("/", permisoController.getAllPermisos);
permisoRouter.get("/:codigoPermiso", permisoController.getPermisoByCodigo);

export default permisoRouter;
