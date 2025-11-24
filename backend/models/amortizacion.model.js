import mongoose from 'mongoose';

const { Schema } = mongoose;

const amortizacionSchema = new Schema(
  {
    financiamientoId: { type: Schema.Types.ObjectId, ref: 'Financiamiento', required: true, immutable: true },
    fecha: { type: Date, required: true },
    capital: { type: Number, required: true },
    interes: { type: Number, required: true },
    mora: { type: Number, required: false, default: 0 },
    saldoCapital: { type: Number, required: true },
    pagado: { type: Boolean, required: true, default: false },
    orden: { type: Number, required: false },
  },
  { timestamps: true }
);

export default mongoose.model('Amortizacion', amortizacionSchema);
