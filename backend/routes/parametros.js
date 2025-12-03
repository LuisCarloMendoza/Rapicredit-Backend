import express from "express";
import { parametrosController } from "../controllers/parametros.controller.js";

const parametrosRouter = express.Router();

parametrosRouter.post('/', parametrosController.createParametros);
parametrosRouter.put('/:codigoParametros', parametrosController.updateParametrosByCodigo);
parametrosRouter.get('/', parametrosController.getAllParametros);
parametrosRouter.get('/:codigoParametros', parametrosController.getParametrosByCodigo);
parametrosRouter.delete('/:codigoParametros', parametrosController.deleteParametrosByCodigo);

export default parametrosRouter;
