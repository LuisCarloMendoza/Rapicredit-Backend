import clienteModel from "../models/cliente.model.js";

export const clienteRepository = {
  createCliente: async (clienteData) => {
    const newCliente = new clienteModel(clienteData);
    return await newCliente.save();
  },
  findByCodigoCliente: async (codigoCliente) => {
    return await clienteModel.findOne({ codigoCliente });
  },
  updateClienteByCodigo: async (codigoCliente, updateData) => {
    // Prevent changing the immutable codigoCliente field from the update payload
    if (updateData && Object.prototype.hasOwnProperty.call(updateData, 'codigoCliente')) {
      delete updateData.codigoCliente;
    }

    // Use findOneAndUpdate to return the updated document and run validators
    return await clienteModel.findOneAndUpdate(
      { codigoCliente },
      updateData,
      { new: true, runValidators: true }
    );
  },
  findAllClientes: async () => {
    return await clienteModel.find();
  },
};