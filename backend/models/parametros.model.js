import mongoose from "mongoose";

const parametrosSchema = new mongoose.Schema(
    {
        codigoParametros: { type: String, unique: true, required: true, immutable: true },
        nombre: { type: String, required: true },
        porcentajeComision: { type: Number, required: true, default: 0 }, // porcentaje en punto flotante (ej. 2.5 => 2.5%)
        interesCorrienteBase: { type: Number, required: false, default: 0 }, // tasa base corriente
        interesMoraBase: { type: Number, required: false, default: 0 }, // tasa por mora
        limitePrestamoMin: { type: Number, required: true, default: 0 },
        limitePrestamoMax: { type: Number, required: true, default: 0 },
        politicaMora: { type: String, required: false, default: "" }, // descripción de la política de mora
        configCAI: { type: [String], default: [] }, 
    },
    { timestamps: true }
);

export default mongoose.model("Parametros", parametrosSchema);