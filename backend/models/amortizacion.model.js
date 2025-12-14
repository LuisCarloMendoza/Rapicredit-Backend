import mongoose from "mongoose";
const { Schema } = mongoose;

const amortizacionSchema = new Schema(
  {
    // Relacionamos con el préstamo
    prestamoId: { type: Schema.Types.ObjectId, ref: "Prestamo", required: true, immutable: true },

    // Detalles de la cuota
    numeroCuota: { type: Number, required: true },  // Número de la cuota
    fechaProgramada: { type: Date, required: true }, // Fecha en la que debe pagarse

    // Montos calculados
    capital: { type: Number, required: true },       // Capital a pagar
    interes: { type: Number, required: true },       // Interés a pagar
    mora: { type: Number, default: 0 },              // Mora si aplica
    saldoCapital: { type: Number, required: true },  // Saldo de capital restante

    // Estado de la cuota
    estadoCuota: {
      type: String,
      enum: ["PENDIENTE", "PAGADA", "PARCIAL", "ATRASADA"],
      default: "PENDIENTE"
    },

    // Pagos realizados (en caso de abonos parciales)
    pagado: { type: Boolean, required: true, default: false },
    capitalPagado: { type: Number, default: 0 },
    interesPagado: { type: Number, default: 0 },
    moraPagada: { type: Number, default: 0 },

    // Activo para control
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Índice para facilitar la búsqueda por prestamoId y numeroCuota
amortizacionSchema.index({ prestamoId: 1, numeroCuota: 1 }, { unique: true });

export default mongoose.model("Amortizacion", amortizacionSchema);
