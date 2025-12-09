import { clienteController } from "../controllers/cliente.controller.js";
import express from "express";
import { requirePermiso } from "../middleware/requirePermiso.js";

const clienteRouter = express.Router();
clienteRouter.post("/", requirePermiso('Gestionar clientes'), clienteController.createCliente);
clienteRouter.put("/:codigoCliente",  requirePermiso('Gestionar clientes'), clienteController.updateClienteByCodigo);
clienteRouter.get("/", requirePermiso('Ver/Buscar cliente'), clienteController.getAllClientes);
clienteRouter.get("/:codigoCliente", requirePermiso('Ver/Buscar cliente'), clienteController.getClienteByCodigo);
// Nuevo endpoint para resumen de clientes
clienteRouter.get('/resumen', requirePermiso('Ver/Buscar cliente'), clienteController.getClientesResumen);

clienteRouter.delete("/:codigoCliente", requirePermiso('Gestionar clientes'), clienteController.deleteClienteByCodigo);
export default clienteRouter;
