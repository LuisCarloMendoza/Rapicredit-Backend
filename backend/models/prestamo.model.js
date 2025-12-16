import mongoose from "mongoose";

const { Schema } = mongoose;

const prestamoSchema = new Schema(
    {
        // Relación con la Solicitud
        solicitudId: { type: Schema.Types.ObjectId, ref: "Solicitud", required: true },

        // Cliente que solicita el préstamo
        clienteId: { type: Schema.Types.ObjectId, ref: "Cliente", required: true },

        // Datos derivados de la solicitud
        tasaInteresId: { type: Schema.Types.ObjectId, ref: "TasaInteres", required: true },  // Tasa de interés aplicada
        frecuenciaPago: {
            type: String,
            enum: ["DIARIA", "SEMANAL", "QUINCENAL", "MENSUAL"],
            required: true
        },  // Frecuencia de pago (de la solicitud)
        capitalSolicitado: { type: Number, required: true },  // Capital solicitado
        cuotaFija: { type: Number, required: true },  // Cuota fija calculada
        plazoCuotas: { type: Number, required: true },  // Número de cuotas
        fechaDesembolso: { type: Date, required: true },  // Fecha en la que se desembolsa el préstamo
        fechaVencimiento: { type: Date, required: true },  // Fecha de vencimiento (última cuota)
        estadoPrestamo: {
            type: String,
            enum: ["VIGENTE", "CERRADO", "RECHAZADO", "PENDIENTE"],
            default: "VIGENTE",
            required: true
        },  // Estado del préstamo: 'VIGENTE', 'CERRADO', etc.
        totalIntereses: { type: Number, default: 0 },  // Total de intereses calculados
        totalPagado: { type: Number, default: 0 },  // Total pagado hasta el momento
        observaciones: { type: String, default: "" },  // Observaciones sobre el préstamo
        activo: { type: Boolean, default: true }  // Estado activo/inactivo
    },
    { timestamps: true }
);

// Virtual para obtener el nombre completo del cliente asociado al préstamo
prestamoSchema.virtual("clienteNombre").get(function () {
    return `${this.clienteId.nombre} ${this.clienteId.apellido}`;
});

// Incluir virtuales en JSON / toObject para que lleguen al front si pasas el doc crudo
prestamoSchema.set("toJSON", { virtuals: true });
prestamoSchema.set("toObject", { virtuals: true });

export default mongoose.model("Prestamo", prestamoSchema);