import mongoose from 'mongoose';

const { Schema } = mongoose;

const gastoSchema = new Schema(
  {
    codigoGasto: { type: String, required: true, unique: true, immutable: true },
    fechaGasto: { type: Date, required: true },
    tipoGasto: { type: String, required: true },
    descripcion: { type: String, default: '' },
    monto: { type: Number, required: true },
    codigoCobradorId: { type: String, required: false }, // codigoUsuario
    codigoFinanciamiento: { type: String, required: false },
    codigoRegistradoPor: { type: String, required: true }, // codigoUsuario
  },
  { timestamps: true }
);

export default mongoose.model('Gasto', gastoSchema);