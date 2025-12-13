// repositories/cliente.repository.js
import Cliente from "../models/cliente.model.js";

export const clienteRepository = {
  // -------------------------------------
  // Crear
  // -------------------------------------
  async createCliente(data) {
    const cliente = new Cliente(data);
    return await cliente.save();
  },

  // -------------------------------------
  // Buscar por campos únicos
  // -------------------------------------
  async findByCodigoCliente(codigoCliente) {
    return await Cliente.findOne({ codigoCliente }).exec();
  },

  async findByIdentidadCliente(identidadCliente) {
    return await Cliente.findOne({ identidadCliente }).exec();
  },

  async findByRTN(RTN) {
    return await Cliente.findOne({ RTN }).exec();
  },

  async findByEmail(email) {
    return await Cliente.findOne({ email }).exec();
  },

  // -------------------------------------
  // Buscar por ID Mongo
  // -------------------------------------
  async findById(id) {
    return await Cliente.findById(id).exec();
  },

  // -------------------------------------
  // Listado
  // -------------------------------------
  async findAllClientes() {
    return await Cliente.find({}).exec();
  },

  // -------------------------------------
  // Actualizar
  // -------------------------------------
  async updateClienteByCodigo(codigoCliente, updateData) {
    return await Cliente.findOneAndUpdate(
      { codigoCliente },
      updateData,
      { new: true } // ← devuelve el documento actualizado
    ).exec();
  },

  // -------------------------------------
  // Eliminar
  // -------------------------------------
  async deleteClienteByCodigo(codigoCliente) {
    return await Cliente.findOneAndDelete({ codigoCliente }).exec();
  },
};
