import { clienteController } from "../controllers/cliente.controller.js";
import express from "express";

const clienteRouter = express.Router();
clienteRouter.post("/", clienteController.createCliente);
clienteRouter.put("/:codigoCliente", clienteController.updateClienteByCodigo);
clienteRouter.get("/", clienteController.getAllClientes);
clienteRouter.get("/:codigoCliente", clienteController.getClienteByCodigo);
// Nuevo endpoint para resumen de clientes
clienteRouter.get('/resumen', clienteController.getClientesResumen);

clienteRouter.delete("/:codigoCliente", clienteController.deleteClienteByCodigo);
export default clienteRouter;
