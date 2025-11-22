import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    codigoUsuario: { type: String, unique: true, required: true },
    usuario: { type: String, required: true }, //Username
    nombreCompleto: { type: String, required: true },
    rol: { type: String, required: true, default: "usuario" }, //Gerente, Supervisor, Asesor
    contraseña: { type: String, required: false }, 
    permisos: { type: [String], default: [] }, 
    actividad: { type: Boolean, default: true },
    uid: { type: String, required: true, unique: true }, 
    email: { type: String, required: true, unique: true },
    telefono: { type: String, required: false },
  },
  { timestamps: true }
);
export default mongoose.model('User', userSchema);