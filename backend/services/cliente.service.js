import { clienteRepository } from "../repositories/cliente.repository.js";

export const clienteService = {
  createCliente: async (clienteData) => {
    const existingCliente = await clienteRepository.findByCodigoCliente(clienteData.codigoCliente);
    if (existingCliente) {
      throw new Error("A cliente with this codigoCliente already exists.");
    }
    const newCliente = await clienteRepository.createCliente(clienteData);
    return newCliente;
  },

  updateClienteByCodigo: async (codigoCliente, updateData) => {
    const existingCliente = await clienteRepository.findByCodigoCliente(codigoCliente);
    if (!existingCliente) {
      throw new Error("Cliente with the provided codigoCliente does not exist.");
    }
    const updatedCliente = await clienteRepository.updateClienteByCodigo(codigoCliente, updateData);
    return updatedCliente;
  },
  getAllClientes: async () => {
    const clientes = await clienteRepository.findAllClientes();
    return clientes;
  },

  getClienteByCodigo: async (codigoCliente) => {
    const cliente = await clienteRepository.findByCodigoCliente(codigoCliente);
    if (!cliente) {
      throw new Error("Cliente with the provided codigoCliente does not exist.");
    }
    return cliente;
  }
};