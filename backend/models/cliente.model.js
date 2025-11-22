import mongoose from "mongoose";

const clienteSchema = new mongoose.Schema(
  {
    codigoCliente: { type: String, unique: true, required: true, immutable: true }, //TODO - Establecer como generar codigo
    identidadCliente: { type: String, required: true, unique: true }, //DNI
    nacionalidad: { type: String, required: true },
    RTN: { type: String, required: true, unique: true }, //Registro Tributario Nacional
    estadoCivil: { type: String, required: true },
    nivelEducativo: { type: String, required: true },
    tipoVivienda: { type: String, required: true },
    antiguedadVivenda: { type: Number, required: true }, //En años
    numerosDependientes: { type: [Number], required: true },
    listadoDependientes: { type: [String], required: true },
    edadDependientes: { type: [Number], required: true }, //PREGUNTAR SI HACER MODELO DEPENDIENTES
    zonaResidencialCliente: { type: String, required: true },
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    telefono: { type: [String], required: true }, //Frontend manejará validaciones
    direccion: { type: String, required: true },
    sexo: { type: String, required: true },
    fechaNacimiento: { type: Date, required: true },
    limiteCredito: { type: Number, required: true, default: 0 },
    tasaCliente: { type: Number, required: true, default: 0 }, //Porcentaje
    frecuenciaPago: { type: String, required: true },
    referencias: { type: [String], default: [] },
    estadoDeuda: {type: [String], require: true}, /// validar
    garantias: { type: [String], default: [] },
    codigoCobrador: { type: String, required: false }, //Decidir si UID o codigoUsuario ###PREGUNTAR SI REQUERIDO
  }, { timestamps: true }
);

export default mongoose.model("Cliente", clienteSchema);