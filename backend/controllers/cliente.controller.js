import { clienteService } from "../services/cliente.service.js";

export const clienteController = {
  createCliente: async (req, res) => {
    try {
      const clienteData = req.body;
      const newCliente = await clienteService.createCliente(clienteData);
      res.status(201).json(newCliente);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  updateClienteByCodigo: async (req, res) => {
    try {
      const codigoCliente = req.params.codigoCliente;
      const updateData = req.body;
      const updatedCliente = await clienteService.updateClienteByCodigo(codigoCliente, updateData);
      res.status(200).json(updatedCliente);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  getAllClientes: async (req, res) => {
    try {
      const data = await clienteService.getAllClientes();
      res.status(200).json(data);
    } catch (err) {
      console.error("getAllClientes error:", err);
      res.status(500).json({ message: "Error al obtener clientes" });
    }
  },

  getClienteByCodigo: async (req, res) => {
    try {
      const codigoCliente = req.params.codigoCliente;
      const cliente = await clienteService.getClienteByCodigo(codigoCliente);
      res.status(200).json(cliente);
    } catch (error) {
      res.status(403).json({ message: error.message });
    }
  },

  // ==== NUEVO: endpoint para /api/clientes/resumen ====
  getClientesResumen: async (req, res) => {
    try {
      const data = await clienteService.getClientesResumen();
      res.status(200).json(data);
    } catch (error) {
      console.error("Error en getClientesResumen:", error);
      res.status(500).json({ message: "Error al obtener resumen de clientes" });
    }
  },


  deleteClienteByCodigo: async (req, res) => {
    try {
      const codigoCliente = req.params.codigoCliente;
      await clienteService.deleteClienteByCodigo(codigoCliente);
      res.status(204).end();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Activar/Desactivar cliente (toggle) por codigoCliente
  toggleClienteActivoByCodigo: async (req, res) => {
    try {
      const codigoCliente = req.params.codigoCliente;
      const updated = await clienteService.toggleClienteActivoByCodigo(codigoCliente);
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
};
