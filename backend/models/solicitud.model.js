import mongoose from "mongoose";

const solicitudSchema = new mongoose.Schema(
  {
    codigoSolicitud: { type: String, unique: true, required: true, immutable: true },

    clienteId: { type: mongoose.Schema.Types.ObjectId, ref: "Cliente", required: true },
    vendedorId: { type: mongoose.Schema.Types.ObjectId, ref: "Empleado", required: true },

    // --- Lo solicitado (base) ---
    capitalSolicitado: { type: Number, required: true },
    tasaInteresId: { type: mongoose.Schema.Types.ObjectId, ref: "TasaInteres", required: false }, // ✅ typo fixed
    frecuenciaPago: {
      type: String,
      enum: ["DIARIO", "SEMANAL", "QUINCENAL", "MENSUAL"],
      required: true,
    },
    plazoCuotas: { type: Number, required: true },

    fechaSolicitud: { type: Date, required: true, default: Date.now },
    finalidadCredito: { type: String, required: true },

    // --- Datos extra (puedes luego tiparlos con sub-schemas) ---
    datosNegocio: { type: Object, default: {} },
    datosConyuge: { type: Object, default: {} },
    referenciasPersonales: { type: [Object], default: [] },
    garantias: { type: [Object], default: [] },

    // --- Preview de amortización (para que admin vea antes de aprobar) ---
    amortizacionPreview: { type: [Object], default: [] },
    cuotaEstimadaComision: { type: Object, default: {} },

    // --- Ajustes aprobados (opcional, recomendado) ---
    capitalAprobado: { type: Number, default: null },
    tasaInteresIdAprobada: { type: mongoose.Schema.Types.ObjectId, ref: "TasaInteres", default: null },
    frecuenciaPagoAprobada: {
      type: String,
      enum: ["DIARIO", "SEMANAL", "QUINCENAL", "MENSUAL"],
      default: null,
    },
    plazoCuotasAprobado: { type: Number, default: null },

    estadoSolicitud: {
      type: String,
      enum: ["REGISTRADA", "EN_REVISION", "APROBADA", "RECHAZADA"],
      required: true,
      default: "REGISTRADA",
    },

    observaciones: { type: String, default: "" },

    usuarioCreacionId: { type: mongoose.Schema.Types.ObjectId, ref: "Empleado", required: false },
    usuarioDecisionId: { type: mongoose.Schema.Types.ObjectId, ref: "Empleado", default: null },

    // ✅ link cuando se aprueba
    prestamoId: { type: mongoose.Schema.Types.ObjectId, ref: "Prestamo", default: null },

    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Solicitud", solicitudSchema);
