import mongoose from "mongoose";

const clienteSchema = new mongoose.Schema(
  {
    // Identificadores
    codigoCliente: {
      type: String,
      unique: true,
      required: true,
      immutable: true, // se genera y no se cambia
    },
    identidadCliente: {
      type: String,
      required: true,
      unique: true,
    }, // DNI
    RTN: {
      type: String,
      required: false,
      unique: true,
    },
    nacionalidad: {
      type: String,
      required: true,
    },

    // Datos personales
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    sexo: { type: String, required: true },
    fechaNacimiento: { type: Date, required: true },
    estadoCivil: { type: String, required: true },
    nivelEducativo: { type: String, required: true },

    // Contacto
    email: { type: String, required: true, unique: true },
    telefono: {
      type: [String],
      required: true, // el front maneja array de teléfonos
    },

    // Dirección residencial
    direccion: { type: String, required: true },
    tipoVivienda: { type: String, required: true },
    antiguedadVivenda: { type: Number, required: true }, // años

    zonaResidencialCliente: { type: String, required: true },
    departamentoResidencia: { type: String, required: true }, // NUEVO
    municipioResidencia: { type: String, required: true }, // NUEVO

    // Cónyuge (el front sí usa estos campos)
    conyugeNombre: { type: String, required: false },
    conyugeTelefono: { type: String, required: false },

    // Financieros
    limiteCredito: { type: Number, required: true, default: 0 },
    tasaCliente: { type: Number, required: true, default: 0 }, // porcentaje
    frecuenciaPago: { type: String, required: true },

    // Estado de deuda: un solo valor (no array)
    riesgoMora: {
      type: String,
      required: true,
      enum: ["Al día", "Mora leve", "Mora moderada", "Mora grave"],
    },

    referencias: { type: [String], default: [], required: true },

    fotosDocs: {
      type: [String], // array de strings (urls/paths)
      default: [],
      required: true
    },

    // Cobrador asociado (código o UID)
    codigoCobrador: { type: String, required: false },

    // Datos del negocio (form los pide)
    negocioNombre: { type: String, required: true },
    negocioTipo: { type: String, required: true },
    negocioTelefono: { type: String, required: true },
    negocioDepartamento: { type: String, required: true },
    negocioMunicipio: { type: String, required: true },
    negocioZonaResidencial: { type: String, required: true },
    fotosNegocio: {
      type: [String], // array de strings (urls/paths)
      default: [],
    },

    // Estado del cliente
    activo: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Virtual para nombreCompleto, útil para el front
clienteSchema.virtual("nombreCompleto").get(function () {
  const parts = [this.nombre, this.apellido].filter(Boolean);
  return parts.join(" ");
});

// Incluir virtuales en JSON / toObject para que lleguen al front si pasas el doc crudo
clienteSchema.set("toJSON", { virtuals: true });
clienteSchema.set("toObject", { virtuals: true });

export default mongoose.model("Cliente", clienteSchema);
