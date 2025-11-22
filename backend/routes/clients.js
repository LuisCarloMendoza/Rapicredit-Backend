import { clienteController } from "../controllers/cliente.controller.js";
import express from "express";

const clienteRouter = express.Router();
clienteRouter.post("/", clienteController.createCliente);
clienteRouter.put("/:codigoCliente", clienteController.updateClienteByCodigo);
clienteRouter.get("/", clienteController.getAllClientes);
clienteRouter.get("/:codigoCliente", clienteController.getClienteByCodigo);
export default clienteRouter;