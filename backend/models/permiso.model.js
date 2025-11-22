import mongoose from 'mongoose';

const permisoSchema = new mongoose.Schema(
  {
    codigoPermiso: { type: String, unique: true, required: true },
    permiso: { type: String, required: true },
    acesso: { type: String, required: true, default: "BOTH" }, // APP, WEB, BOTH
    descripcion: { type: String, required: false },  
  },
  { timestamps: true }
);
export default mongoose.model('Permiso', permisoSchema);