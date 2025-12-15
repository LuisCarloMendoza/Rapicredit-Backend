// services/cliente.service.js
import { clienteRepository } from "../repositories/cliente.repository.js";



export const clienteService = {
  // ---------- Helpers básicos ----------

  _isValidEmail: (email) => {
    if (typeof email !== "string") return false;
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  },

  _isValidDate: (d) => {
    if (d === null || d === undefined || d === "") return false;
    const date = new Date(d);
    return !Number.isNaN(date.getTime());
  },

  _toNumberOrNull: (value) => {
    if (value === null || value === undefined || value === "") return null;
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  },

  _ensureStringArray: (value) => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value
        .map((v) => (v == null ? "" : String(v)))
        .filter((v) => v.trim() !== "");
    }
    // Si viene como string separado por comas
    return String(value)
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v !== "");
  },

  // ---------- Normalización de payloads ----------

  /**
   * Normaliza el payload de creación proveniente del frontend
   * (strings en inputs) al shape/tipos que espera el schema de Mongoose.
   */
  _normalizeCreateData: (data) => {
    const normalized = { ...data };

    // Asegurar arrays de string
    normalized.telefono = clienteService._ensureStringArray(data.telefono);
    normalized.referencias = clienteService._ensureStringArray(
      data.referencias,
    );
    normalized.garantias = clienteService._ensureStringArray(data.garantias);

    // NUEVO: fotosDocs
    normalized.fotosDocs = clienteService._ensureStringArray(
      data.fotosDocs,
    );

    // Números
    normalized.antiguedadVivenda =
      clienteService._toNumberOrNull(data.antiguedadVivenda) ?? 0;
    normalized.limiteCredito =
      clienteService._toNumberOrNull(data.limiteCredito) ?? 0;
    normalized.tasaCliente =
      clienteService._toNumberOrNull(data.tasaCliente) ?? 0;

    // Fechas
    if (data.fechaNacimiento && clienteService._isValidDate(data.fechaNacimiento)) {
      normalized.fechaNacimiento = new Date(data.fechaNacimiento);
    }

    // 🔁 Compatibilidad: si viene estadoDeuda desde el front viejo, mapearlo a riesgoMora
    if (!normalized.riesgoMora && data.estadoDeuda) {
      normalized.riesgoMora = data.estadoDeuda;
    }

    return normalized;
  },

  /**
   * Normaliza parcialmente el payload de update (no toca campos que no vienen).
   */
  _normalizeUpdateData: (updateData) => {
    const normalized = { ...updateData };

    if (Object.prototype.hasOwnProperty.call(updateData, "telefono")) {
      normalized.telefono = clienteService._ensureStringArray(
        updateData.telefono,
      );
    }

    if (
      Object.prototype.hasOwnProperty.call(updateData, "referencias")
    ) {
      normalized.referencias = clienteService._ensureStringArray(
        updateData.referencias,
      );
    }

    if (Object.prototype.hasOwnProperty.call(updateData, "garantias")) {
      normalized.garantias = clienteService._ensureStringArray(
        updateData.garantias,
      );
    }

    if (Object.prototype.hasOwnProperty.call(updateData, "fotosDocs")) {
      normalized.fotosDocs = clienteService._ensureStringArray(
        updateData.fotosDocs,
      );
    }

    if (
      Object.prototype.hasOwnProperty.call(
        updateData,
        "antiguedadVivenda",
      )
    ) {
      normalized.antiguedadVivenda =
        clienteService._toNumberOrNull(updateData.antiguedadVivenda);
    }

    if (Object.prototype.hasOwnProperty.call(updateData, "limiteCredito")) {
      normalized.limiteCredito =
        clienteService._toNumberOrNull(updateData.limiteCredito);
    }

    if (Object.prototype.hasOwnProperty.call(updateData, "tasaCliente")) {
      normalized.tasaCliente =
        clienteService._toNumberOrNull(updateData.tasaCliente);
    }

    if (
      Object.prototype.hasOwnProperty.call(
        updateData,
        "fechaNacimiento",
      ) &&
      updateData.fechaNacimiento
    ) {
      if (!clienteService._isValidDate(updateData.fechaNacimiento)) {
        throw new Error("fechaNacimiento must be a valid date");
      }
      normalized.fechaNacimiento = new Date(updateData.fechaNacimiento);
    }

    if (!normalized.riesgoMora && updateData.estadoDeuda) {
      normalized.riesgoMora = updateData.estadoDeuda;
    }

    return normalized;
  },

  // ---------- Validaciones ----------

  _validateCreateData: (data) => {
    const required = [
      "codigoCliente",
      "identidadCliente",
      "nacionalidad",
      "estadoCivil",
      "nivelEducativo",
      "sexo",
      "fechaNacimiento",
      "email",
      "telefono",
      "direccion",
      "tipoVivienda",
      "antiguedadVivenda",
      "zonaResidencialCliente",
      "departamentoResidencia",
      "municipioResidencia",
      "limiteCredito",
      "tasaCliente",
      "frecuenciaPago",
      "riesgoMora",
      "nombre",
      "apellido",
    ];

    const missing = [];
    for (const key of required) {
      if (
        data[key] === undefined ||
        data[key] === null ||
        data[key] === ""
      ) {
        missing.push(key);
      }
    }
    if (missing.length) {
      throw new Error(`Missing required fields: ${missing.join(", ")}`);
    }

    if (!clienteService._isValidEmail(data.email)) {
      throw new Error("Invalid email format");
    }

    if (!clienteService._isValidDate(data.fechaNacimiento)) {
      throw new Error("fechaNacimiento must be a valid date");
    }

    if (!Array.isArray(data.telefono) || data.telefono.length === 0) {
      throw new Error("telefono must be a non-empty array of strings");
    }
  },

  _validateUpdateData: (updateData) => {
    if (!updateData || typeof updateData !== "object") {
      throw new Error("Invalid update payload");
    }

    // No permitir cambiar codigoCliente
    if (
      Object.prototype.hasOwnProperty.call(
        updateData,
        "codigoCliente",
      )
    ) {
      throw new Error("codigoCliente cannot be updated");
    }

    if (
      Object.prototype.hasOwnProperty.call(updateData, "email") &&
      !clienteService._isValidEmail(updateData.email)
    ) {
      throw new Error("Invalid email format");
    }

    if (
      Object.prototype.hasOwnProperty.call(
        updateData,
        "fechaNacimiento",
      ) &&
      updateData.fechaNacimiento &&
      !clienteService._isValidDate(updateData.fechaNacimiento)
    ) {
      throw new Error("fechaNacimiento must be a valid date");
    }

    if (
      Object.prototype.hasOwnProperty.call(updateData, "telefono") &&
      !Array.isArray(updateData.telefono)
    ) {
      throw new Error("telefono must be an array of strings");
    }

    if (
      Object.prototype.hasOwnProperty.call(updateData, "riesgoMora") &&
      updateData.riesgoMora
    ) {
      const riesgoValidos = ["Al día", "Mora leve", "Mora moderada", "Mora grave"];
      if (!riesgoValidos.includes(updateData.riesgoMora)) {
        throw new Error("riesgoMora has an invalid value");
      }
    }
  },

  // ---------- Crear cliente ----------

  createCliente: async (rawData) => {
    // 1) Normalizar payload del front
    const data = clienteService._normalizeCreateData(rawData);

    // 2) Validar campos requeridos/formato
    clienteService._validateCreateData(data);

    // 3) Verificar unicidad básica (según tu modelo)
    const existingByCodigo =
      await clienteRepository.findByCodigoCliente(data.codigoCliente);
    if (existingByCodigo) {
      throw new Error("A client with this codigoCliente already exists.");
    }

    const existingByIdentidad =
      await clienteRepository.findByIdentidadCliente(
        data.identidadCliente,
      );
    if (existingByIdentidad) {
      throw new Error(
        "A client with this identidadCliente already exists.",
      );
    }

    /*const existingByRtn = await clienteRepository.findByRTN(data.RTN);
    if (existingByRtn) {
      throw new Error("A client with this RTN already exists.");
    } */

    const existingByEmail = await clienteRepository.findByEmail(data.email);
    if (existingByEmail) {
      throw new Error("A client with this email already exists.");
    }

    // 4) Crear en base de datos
    const created = await clienteRepository.createCliente(data);
    return created;
  },

  // ---------- Actualizar cliente por código ----------

  updateClienteByCodigo: async (codigoCliente, rawUpdateData) => {
    if (!codigoCliente) {
      throw new Error("codigoCliente is required for update");
    }

    const normalized = clienteService._normalizeUpdateData(rawUpdateData);
    clienteService._validateUpdateData(normalized);

    const existing = await clienteRepository.findByCodigoCliente(
      codigoCliente,
    );
    if (!existing) {
      throw new Error(
        "Cliente with the provided codigoCliente does not exist.",
      );
    }

    const updated = await clienteRepository.updateClienteByCodigo(
      codigoCliente,
      normalized,
    );
    return updated;
  },

  // ---------- Resumen para la tabla del front ----------

  /**
   * Devuelve un arreglo de "resúmenes" de clientes para la tabla del frontend.
   * Campos:
   *  - id
   *  - codigoCliente
   *  - nombreCompleto
   *  - identidadCliente
   *  - telefonoPrincipal
   *  - departamentoResidencia
   *  - municipioResidencia
   *  - zonaResidencialCliente
   *  - actividad (boolean)
   */
  getAllClientes: async () => {
    const clientes = await clienteRepository.findAllClientes();

    if (!clientes || clientes.length === 0) {
      return [];
    }

    const resumen = clientes.map((c) => {
      const nombreCompleto =
        c.nombreCompleto ||
        [c.nombre, c.apellido].filter(Boolean).join(" ") ||
        "Cliente";

      let telefonoPrincipal = null;
      if (Array.isArray(c.telefono) && c.telefono.length > 0) {
        telefonoPrincipal = c.telefono[0];
      }

      return {
        id: c._id.toString(),
        codigoCliente: c.codigoCliente,
        nombreCompleto,
        identidadCliente: c.identidadCliente || null,
        telefonoPrincipal,
        departamentoResidencia: c.departamentoResidencia || null,
        municipioResidencia: c.municipioResidencia || null,
        zonaResidencialCliente: c.zonaResidencialCliente || null,
        actividad: c.activo === true,
      };
    });

    return resumen;
  },

  // ---------- Obtener/detalle básico ----------

  getClienteByCodigo: async (codigoCliente) => {
    const item = await clienteRepository.findByCodigoCliente(codigoCliente);
    if (!item) {
      throw new Error(
        "Cliente with the provided codigoCliente does not exist.",
      );
    }
    return item;
  },

  getClienteById: async (id) => {
    const item = await clienteRepository.findById(id);
    if (!item) {
      throw new Error("Cliente with the provided id does not exist.");
    }
    return item;
  },

  // ---------- Eliminar ----------

  deleteClienteByCodigo: async (codigoCliente) => {
    if (!codigoCliente) {
      throw new Error("codigoCliente is required for deleting cliente.");
    }

    const existing = await clienteRepository.findByCodigoCliente(
      codigoCliente,
    );
    if (!existing) {
      throw new Error(
        "Cliente with the provided codigoCliente does not exist.",
      );
    }

    return await clienteRepository.deleteClienteByCodigo(codigoCliente);
  },

  // ---------- Activar/Desactivar (toggle) ----------
  toggleClienteActivoByCodigo: async (codigoCliente) => {
    if (!codigoCliente) {
      throw new Error("codigoCliente is required for toggling activo.");
    }

    const existing = await clienteRepository.findByCodigoCliente(codigoCliente);
    if (!existing) {
      throw new Error("Cliente with the provided codigoCliente does not exist.");
    }

    const nuevoEstado = existing.activo !== true; // true->false, false/undefined->true
    const updated = await clienteRepository.updateClienteByCodigo(codigoCliente, { activo: nuevoEstado });
    return updated;
  },
};
