import mongoose from 'mongoose';

const { Schema } = mongoose;

const frecuenciaSchema = new Schema(
  {
    codigoFrecuenciaPagos: { type: String, required: true, unique: true, immutable: true },
    nombre: { type: String, required: true },
    diasEntreCuotas: { type: Number, required: true, default: 0 },
    descripcion: { type: String, default: '' },
    activa: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('FrecuenciaPago', frecuenciaSchema);
