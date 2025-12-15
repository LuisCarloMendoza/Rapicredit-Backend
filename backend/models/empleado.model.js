import mongoose from 'mongoose';

const empleadoSchema = new mongoose.Schema(
  {
    codigoUsuario: { type: String, required: true, unique: true },
    uid: { type: String, required: false },
    usuario: { type: String, required: true }, //Username
    nombreCompleto: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    telefono: { type: String, required: true },
    rol: { type: String, required: true },
    actividad: { type: Boolean, default: true },
    permisos: { type: [String], default: [] },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Empleado', empleadoSchema);
