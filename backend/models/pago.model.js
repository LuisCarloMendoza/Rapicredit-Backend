import mongoose from 'mongoose';

const { Schema } = mongoose;

const pagoSchema = new Schema(
  {
    codigoPago: { type: String, required: true, unique: true, immutable: true },
    financiamientoId: { type: Schema.Types.ObjectId, ref: 'Financiamiento', required: true },
    clienteId: { type: Schema.Types.ObjectId, ref: 'Cliente', required: true },
    cobradorId: { type: Schema.Types.ObjectId, ref: 'Empleado', required: true },
    fechaPago: { type: Date, required: true },
    montoPago: { type: Number, required: true },
    aplicadoAMora: { type: Number, default: 0 },
    aplicadoAInteres: { type: Number, default: 0 },
    aplicadoACapital: { type: Number, default: 0 },
    saldoCapitalDespues: { type: Number, required: false, default: 0 },
    metodoPago: { type: String, required: true, default: 'EFECTIVO' },
    numeroComprobante: { type: String, required: false, default: '' },
    caiUsado: { type: String, required: false, default: '' },
    rutaComprobanteFotoId: { type: Schema.Types.ObjectId, required: false },
    observaciones: { type: String, required: false, default: '' },
    tipoPago: { type: String, required: true, default: 'NORMAL' },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Pago', pagoSchema);
