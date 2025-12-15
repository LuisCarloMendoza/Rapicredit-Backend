import mongoose from 'mongoose';

const empleadoSchema = new mongoose.Schema(
  {
    codigoUsuario: { type: String, unique: true, required: true, immutable: true }, //TODO - Establecer como generar codigo
    usuario: { type: String, required: true }, //Username
    nombreCompleto: { type: String, required: true },
    rol: { type: String, required: true, default: "usuario" }, //Gerente, Supervisor, Asesor
    password: { type: String, required: true }, 
    permisos: { type: [String], default: [] }, 
    actividad: { type: Boolean, default: true },
    uid: { type: String, required: true, unique: true, immutable: true }, 
    email: { type: String, required: true, unique: true },
    telefono: { type: String, required: true },
  },
  { timestamps: true }
);
export default mongoose.model('Empleado', empleadoSchema);