import mongoose from 'mongoose';

const { Schema } = mongoose;

const gastoSchema = new Schema(
  {
    codigoGasto: { type: String, required: true, unique: true, immutable: true },
    fechaGasto: { type: Date, required: true },
    tipoGasto: { type: String, required: true },
    descripcion: { type: String, default: '' },
    monto: { type: Number, required: true },
    cobradorId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    financiamientoId: { type: Schema.Types.ObjectId, ref: 'Financiamiento', required: false },
    zonaCobroId: { type: Schema.Types.ObjectId, required: false },
    registradoPorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Gasto', gastoSchema);
