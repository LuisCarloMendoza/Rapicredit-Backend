// app.js
import "./firebase.js";
import dotenv from 'dotenv';
import express from 'express';
import { MongoClient, ServerApiVersion } from 'mongodb';
import fs from 'fs';
import admin from 'firebase-admin';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// ---- MongoDB Client ----
const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
  },
});

let db;
let workersCollection;   // apuntará a la colección "trabajadores"
let functionsCollection; // apuntará a la colección "funciones"

// Conectar a MongoDB
async function connect() {
  try {
    await client.connect();

    // Nombre de la base de datos
    db = client.db('Rapicredit');

    // ============================
    //   ESQUEMA: FUNCIONES (catálogo fijo)
    // ============================

    const funcionesSchema = {
      bsonType: "object",
      required: ["key", "label", "accessType"],
      properties: {
        key: {
          bsonType: "string",
          description: "Identificador único de la función"
        },
        label: {
          bsonType: "string",
          description: "Nombre visible de la función"
        },
        accessType: {
          enum: ["WEB", "APP", "BOTH"],
          description: "Dónde aplica la función (WEB, APP o BOTH)"
        },
        module: {
          bsonType: "string",
          description: "Módulo o categoría (opcional)"
        },
        description: {
          bsonType: "string",
          description: "Descripción de la función (opcional)"
        }
      },
      additionalProperties: false
    };

    await db.command({
      collMod: "funciones",
      validator: { $jsonSchema: funcionesSchema },
      validationLevel: "strict"
    }).catch(async (err) => {
      // Si la colección aún no existe, la creamos con el validador
      if (err.codeName === 'NamespaceNotFound') {
        await db.createCollection("funciones", {
          validator: { $jsonSchema: funcionesSchema },
          validationLevel: "strict"
        });
      } else {
        throw err;
      }
    });

    // ============================
    //   ESQUEMA: TRABAJADORES
    // ============================

    const trabajadoresSchema = {
      bsonType: "object",
      required: ["codigoUsuario", "usuario", "rol", "contrasena", "permisos", "actividad"],
      properties: {
        codigoUsuario: {
          bsonType: "string",
          description: "Código de usuario (lo podemos generar automáticamente)"
      },
      usuario: {
        bsonType: "string",
        description: "Nombre de usuario para iniciar sesión"
      },
      rol: {
        enum: ["Gerente", "Supervisor", "Asesor"],
        description: "Rol del trabajador"
      },
      asignado: {
        bsonType: "string",
        description: "A quién o qué está asignado (oficina, zona, etc.)"
      },
      contrasena: {
        bsonType: "string",
        description: "Contraseña (idealmente ya hasheada)"
      },
      permisos: {
        bsonType: "array",
        items: { bsonType: "string" }, // keys de funciones
        description: "Lista de keys de funciones asignadas al trabajador"
      },
      actividad: {
        enum: ["Activo", "Inactivo"],
        description: "Estado del trabajador (Activo o Inactivo)"
      }
    },
    additionalProperties: false
  };

  await db.command({
   collMod: "trabajadores",
    validator: { $jsonSchema: trabajadoresSchema },
    validationLevel: "strict"
  }).catch(async (err) => {
    if (err.codeName === 'NamespaceNotFound') {
      await db.createCollection("trabajadores", {
        validator: { $jsonSchema: trabajadoresSchema },
        validationLevel: "strict"
      });
    } else {
      throw err;
    }
  });

    // Handlers de las colecciones
    workersCollection = db.collection('trabajadores');
    functionsCollection = db.collection('funciones');

    console.log('✅ Conectado a la base de datos Rapicredit');
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error);
    process.exit(1);
  }
}

// Revisar conexión Endpoint
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Firebase Admin SDK (ESM-compatible)

export const auth = admin.auth();

// Comenzar el servidor
async function start() {
  await connect();
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
}

// ---- CRUD ENDPOINTS ----
// Usamos el parser incorporado de Express en lugar de `body-parser`.
app.use(express.json());

// =============================
//   CRUD FUNCIONES (CATÁLOGO)
// =============================

// Obtener todas las funciones
app.get('/api/funciones', async (req, res) => {
  try {
    const funciones = await functionsCollection.find({}).toArray();
    res.json(funciones);
  } catch (err) {
    console.error('Error obteniendo funciones:', err);
    res.status(500).json({ error: 'Error obteniendo funciones' });
  }
});

// Obtener una función por key
app.get('/api/funciones/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const funcion = await functionsCollection.findOne({ key });

    if (!funcion) {
      return res.status(404).json({ error: 'Función no encontrada' });
    }

    res.json(funcion);
  } catch (err) {
    console.error('Error obteniendo función:', err);
    res.status(500).json({ error: 'Error obteniendo función' });
  }
});

// Crear una función (catálogo fijo, se usará muy poco)
app.post('/api/funciones', async (req, res) => {
  try {
    const { key, label, accessType, module, description } = req.body;

    if (!key || !label || !accessType) {
      return res.status(400).json({
        error: 'key, label y accessType son obligatorios (WEB, APP o BOTH)',
      });
    }

    const yaExiste = await functionsCollection.findOne({ key });
    if (yaExiste) {
      return res.status(409).json({ error: 'Ya existe una función con ese key' });
    }

    const doc = {
      key,
      label,
      accessType,          // "WEB" | "APP" | "BOTH"
      module: module || null,
      description: description || null,
    };

    const result = await functionsCollection.insertOne(doc);
    res.status(201).json({ _id: result.insertedId, ...doc });
  } catch (err) {
    console.error('Error creando función:', err);
    res.status(500).json({ error: 'Error creando función' });
  }
});

// Actualizar una función por key
app.put('/api/funciones/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { label, accessType, module, description } = req.body;

    const update = {};
    if (label !== undefined) update.label = label;
    if (accessType !== undefined) update.accessType = accessType;
    if (module !== undefined) update.module = module;
    if (description !== undefined) update.description = description;

    const result = await functionsCollection.findOneAndUpdate(
      { key },
      { $set: update },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({ error: 'Función no encontrada' });
    }

    res.json(result.value);
  } catch (err) {
    console.error('Error actualizando función:', err);
    res.status(500).json({ error: 'Error actualizando función' });
  }
});

// Eliminar una función por key (si en la práctica no quieres borrar, luego lo cambiamos)
app.delete('/api/funciones/:key', async (req, res) => {
  try {
    const { key } = req.params;

    const result = await functionsCollection.deleteOne({ key });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Función no encontrada' });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Error eliminando función:', err);
    res.status(500).json({ error: 'Error eliminando función' });
  }
});


// =============================
//   CRUD TRABAJADORES
// =============================

// Generar código de usuario si no viene en el body
function generarCodigoUsuario() {
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `USR-${random}`;
}

// Obtener todos los trabajadores
app.get('/api/trabajadores', async (req, res) => {
  try {
    const trabajadores = await workersCollection.find({}).toArray();
    res.json(trabajadores);
  } catch (err) {
    console.error('Error obteniendo trabajadores:', err);
    res.status(500).json({ error: 'Error obteniendo trabajadores' });
  }
});

// Obtener un trabajador por código de usuario
app.get('/api/trabajadores/:codigoUsuario', async (req, res) => {
  try {
    const { codigoUsuario } = req.params;
    const trabajador = await workersCollection.findOne({ codigoUsuario });

    if (!trabajador) {
      return res.status(404).json({ error: 'Trabajador no encontrado' });
    }

    res.json(trabajador);
  } catch (err) {
    console.error('Error obteniendo trabajador:', err);
    res.status(500).json({ error: 'Error obteniendo trabajador' });
  }
});

// Crear trabajador
app.post('/api/trabajadores', async (req, res) => {
  try {
    let { codigoUsuario, usuario, rol, asignado, contrasena, permisos } = req.body;

    if (!usuario || !rol || !contrasena) {
      return res.status(400).json({
        error: 'usuario, rol y contrasena son obligatorios',
      });
    }

    codigoUsuario = codigoUsuario || generarCodigoUsuario();
    permisos = Array.isArray(permisos) ? permisos : [];

    // Comprobar que no exista otro con el mismo código
    const yaExiste = await workersCollection.findOne({ codigoUsuario });
    if (yaExiste) {
      return res
        .status(409)
        .json({ error: 'Ya existe un trabajador con ese código de usuario' });
    }

    const doc = {
      codigoUsuario,
      usuario,
      rol,             // "Gerente" | "Supervisor" | "Asesor"
      asignado: asignado || "",
      contrasena,      // idealmente aquí deberías guardar un hash
      permisos,        // array de keys de funciones
    };

    const result = await workersCollection.insertOne(doc);
    res.status(201).json({ _id: result.insertedId, ...doc });
  } catch (err) {
    console.error('Error creando trabajador:', err);
    res.status(500).json({ error: 'Error creando trabajador' });
  }
});

// Actualizar trabajador por código de usuario (datos generales)
app.put('/api/trabajadores/:codigoUsuario', async (req, res) => {
  try {
    const { codigoUsuario } = req.params;
    const { usuario, rol, asignado, contrasena, permisos } = req.body;

    const update = {};
    if (usuario !== undefined) update.usuario = usuario;
    if (rol !== undefined) update.rol = rol;
    if (asignado !== undefined) update.asignado = asignado;
    if (contrasena !== undefined) update.contrasena = contrasena;
    if (permisos !== undefined) {
      update.permisos = Array.isArray(permisos) ? permisos : [];
    }

    const result = await workersCollection.findOneAndUpdate(
      { codigoUsuario },
      { $set: update },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({ error: 'Trabajador no encontrado' });
    }

    res.json(result.value);
  } catch (err) {
    console.error('Error actualizando trabajador:', err);
    res.status(500).json({ error: 'Error actualizando trabajador' });
  }
});

// Actualizar solo permisos de un trabajador
app.patch('/api/trabajadores/:codigoUsuario/permisos', async (req, res) => {
  try {
    const { codigoUsuario } = req.params;
    const { permisos } = req.body;

    if (!Array.isArray(permisos)) {
      return res.status(400).json({ error: 'permisos debe ser un arreglo de strings' });
    }

    const result = await workersCollection.findOneAndUpdate(
      { codigoUsuario },
      { $set: { permisos } },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({ error: 'Trabajador no encontrado' });
    }

    res.json(result.value);
  } catch (err) {
    console.error('Error actualizando permisos:', err);
    res.status(500).json({ error: 'Error actualizando permisos' });
  }
});

// Eliminar trabajador por código de usuario
app.delete('/api/trabajadores/:codigoUsuario', async (req, res) => {
  try {
    const { codigoUsuario } = req.params;

    const result = await workersCollection.deleteOne({ codigoUsuario });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Trabajador no encontrado' });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Error eliminando trabajador:', err);
    res.status(500).json({ error: 'Error eliminando trabajador' });
  }
});

start();



