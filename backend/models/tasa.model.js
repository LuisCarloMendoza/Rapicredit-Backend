import mongoose from 'mongoose';

const { Schema } = mongoose;

const tasaSchema = new Schema(
  {
    codigoTasa: { type: String, required: true, unique: true, immutable: true },
    nombre: { type: String, required: true, unique: true },
    descripcion: { type: String, default: '' },
    porcentajeInteres: { type: Number, required: true, default: 0 },
    porcentajeDesembolso: { type: Number, required: false, default: 0 },
    capitalMin: { type: Number, required: false, default: 0 },
    capitalMax: { type: Number, required: false, default: 0 },
    diasAntesMora: { type: Number, required: false, default: 0 },
    requiereSolicitud: { type: Boolean, required: false, default: false },
    activa: { type: Boolean, required: false, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('TasaInteres', tasaSchema);
