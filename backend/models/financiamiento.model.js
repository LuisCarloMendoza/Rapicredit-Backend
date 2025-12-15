import mongoose from 'mongoose';

const { Schema } = mongoose;

const financiamientoSchema = new Schema(
  {
    codigoFinanciamiento: { type: String, unique: true, required: true, immutable: true },
    solicitudId: { type: Schema.Types.ObjectId, ref: 'Solicitud', required: false },
    clienteId: { type: Schema.Types.ObjectId, ref: 'Cliente', required: true },
    cobradorAsignadoId: { type: Schema.Types.ObjectId, ref: 'Empleado', required: false },
    capitalInicial: { type: Number, required: true },
    saldoCapital: { type: Number, required: true },
    tasaInteresId: { type: Schema.Types.ObjectId, ref: 'TasaInteres', required: false },
    frecuenciaPagoId: { type: Schema.Types.ObjectId, ref: 'FrecuenciaPago', required: false },
    cuota: { type: Number, required: true },
    fechaDesembolso: { type: Date, required: true },
    fechaVencimiento: { type: Date, required: true },
    estadoFinanciamiento: { type: String, required: true, default: 'VIGENTE' },
    // tablaAmortizacion has been removed and is now stored in a separate collection (`amortizaciones`)
    totalInteresesPlan: { type: Number, default: 0 },
    totalMoraPlan: { type: Number, default: 0 },
    totalPagado: { type: Number, default: 0 },
    totalMoraCobrada: { type: Number, default: 0 },
    observaciones: { type: String, default: '' },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Financiamiento', financiamientoSchema);
