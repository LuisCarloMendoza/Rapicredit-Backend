import Empleado from '../models/empleado.model.js';

export const empleadoRepository = {
    findByUid: async (uid) => {
        return await Empleado.findOne({ uid });
    },
    findByCodigoUsuario: async (codigoUsuario) => {
        return await Empleado.findOne({ codigoUsuario });
    },
    createEmpleado: async (empleadoData) => {
        const nuevoEmpleado = new Empleado(empleadoData);
        return await nuevoEmpleado.save();
    },
    updateEmpleadoByUid: async (uid, updateData) => {
        return await Empleado.findOneAndUpdate({ uid }, updateData, { new: true });
    },
    updateEmpleadoByCodigoUsuario: async (codigoUsuario, updateData) => {
        return await Empleado.findOneAndUpdate({ codigoUsuario }, updateData, { new: true });
    },
    findByUsuario: async (usuario) => {
        return await Empleado.findOne({ usuario });
    },
    findByEmail: async (email) => {
        return await Empleado.findOne({ email });
    },
    deleteByCodigoUsuario: async (codigoUsuario) => {
        return await Empleado.findOneAndUpdate(
            { codigoUsuario },
            { estado: false },
            { new: true }
        );
    },
    // Empleados activos con campos básicos para listados ligeros
    findActivosLite: async () => {
        return await Empleado.find({ estado: true })
            .select("codigoUsuario nombreCompleto rol usuario email telefono");
    },
    // Empleados (activos e inactivos) con campos básicos + estado
    findLiteAll: async () => {
        return await Empleado.find({})
            .select("codigoUsuario nombreCompleto rol usuario email telefono estado");
    }
};
