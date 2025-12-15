import mongoose from "mongoose";

const { Schema } = mongoose;

const prestamoSchema = new Schema(
    {
        // Identificador humano
        codigoPrestamo: {
            type: String,
            unique: true,
            required: true,
            immutable: true,
        },

        // Link opcional a la solicitud aprobada (opción C)
        solicitudId: { type: Schema.Types.ObjectId, ref: "Solicitud", required: false },

        // Relaciones
        clienteId: { type: Schema.Types.ObjectId, ref: "Cliente", required: true },
        cobradorAsignadoId: { type: Schema.Types.ObjectId, ref: "Empleado", required: false },

        // Montos
        capitalInicial: { type: Number, required: true },
        saldoCapital: { type: Number, required: true },

        // Catálogo de tasas (como dijiste)
        tasaInteresId: { type: Schema.Types.ObjectId, ref: "TasaInteres", required: false },

        // ✅ Frecuencia SIN modelo: guardamos canónico
        frecuenciaPago: {
            type: String,
            enum: ["DIARIA", "SEMANAL", "QUINCENAL", "MENSUAL"],
            required: true,
        },

        cuota: { type: Number, required: true },

        // Fechas
        fechaDesembolso: { type: Date, required: true },
        fechaVencimiento: { type: Date, required: true },

        // Estado operativo (dijiste: vigente al aprobar)
        estadoPrestamo: { type: String, required: true, default: "VIGENTE" },

        // Totales (igual que financiamiento)
        totalInteresesPlan: { type: Number, default: 0 },
        totalMoraPlan: { type: Number, default: 0 },
        totalPagado: { type: Number, default: 0 },
        totalMoraCobrada: { type: Number, default: 0 },

        observaciones: { type: String, default: "" },
        activo: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model("Prestamo", prestamoSchema);