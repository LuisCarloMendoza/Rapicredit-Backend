import mongoose from 'mongoose';

const { Schema } = mongoose;

const tasaSchema = new Schema(
  {
    codigoTasa: { type: String, required: true },
    nombre: { type: String, required: true, unique: true },
    notas: { type: String, default: '' },
    tasaAnual: { type: Number, required: true, default: 0 },
    tasaMora: { type: Number, required: false, default: 0 },
    minimoCapital: { type: Number, required: false, default: 0 },
    maximoCapital: { type: Number, required: false, default: 0 },
    diasGracia: { type: Number, required: false, default: 0 },
    frecuenciaCobro: { type: String, enum: ['Diario','Semanal','Quincenal','Mensual'], default: 'Mensual' },
    vigenciaDesde: { type: Date },
    vigenciaHasta: { type: Date },
    solicitudRequerida: { type: Boolean, required: false, default: false },
    vigente: { type: Boolean, required: false, default: true },
  },
  { timestamps: true }
);

// Único solo entre tasas vigentes; si una tasa se desactiva (vigente=false),
// su código puede reutilizarse.
tasaSchema.index({ codigoTasa: 1 }, { unique: true, partialFilterExpression: { vigente: true } });

export default mongoose.model('TasaInteres', tasaSchema);