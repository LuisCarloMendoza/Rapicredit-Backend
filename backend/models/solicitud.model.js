import mongoose from 'mongoose';

const solicitudSchema = new mongoose.Schema(
  {
    codigoSolicitud: { type: String, unique: true, required: true, immutable: true },
    clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
    vendedorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    capitalSolicitado: { type: Number, required: true },
    tasInteresId: { type: mongoose.Schema.Types.ObjectId, required: false },
    frecuenciaPagoId: { type: mongoose.Schema.Types.ObjectId, required: false },
    plazoCuotas: { type: Number, required: true },
    fechaSolicitud: { type: Date, required: true, default: Date.now },
    finalidadCredito: { type: String, required: true },
    datosNegocio: { type: Object, default: {} },
    datosConyuge: { type: Object, default: {} },
    referenciasPersonales: { type: [Object], default: [] },
    garantias: { type: [Object], default: [] },
    tablaAmortizacion: { type: [Object], default: [] },
    cuotaEstimadaComision: { type: Object, default: {} },
    estadoSolicitud: { 
      type: String, 
      enum: ['REGISTRADA', 'EN_REVISIÓN', 'APROBADA', 'RECHAZADA'],
      required: true,
      default: 'REGISTRADA'
    },
    observaciones: { type: String, default: '' },
    usuarioCreacionId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, //TODO CAMBIAR A TRUE
    usuarioDecisionId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  }, 
  { timestamps: true }
);

export default mongoose.model('Solicitud', solicitudSchema);
