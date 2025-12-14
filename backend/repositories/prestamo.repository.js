import Prestamo from "../models/prestamo.model.js";

export const prestamoRepository = {
    async create(data) {
        return await Prestamo.create(data);
    },

    async findById(id) {
        return await Prestamo.findById(id).exec();
    },

    async findByCodigoPrestamo(codigoPrestamo) {
        return await Prestamo.findOne({ codigoPrestamo }).exec();
    },

    async findAll(filtros = {}) {
        return await Prestamo.find(filtros).exec();
    },

    async updateById(id, updateData) {
        return await Prestamo.findByIdAndUpdate(id, updateData, { new: true }).exec();
    },

    async updateByCodigo(codigoPrestamo, updateData) {
        return await Prestamo.findOneAndUpdate(
            { codigoPrestamo },
            updateData,
            { new: true }
        ).exec();
    },

    async deleteById(id) {
        return await Prestamo.findByIdAndDelete(id).exec();
    },

    async deleteByCodigo(codigoPrestamo) {
        return await Prestamo.findOneAndDelete({ codigoPrestamo }).exec();
    },
};
