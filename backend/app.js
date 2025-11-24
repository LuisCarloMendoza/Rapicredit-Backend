// app.js
import "./firebase.js";
import dotenv from 'dotenv';
import express from 'express';
import { MongoClient, ServerApiVersion } from 'mongodb';
import mongoose from 'mongoose';
import fs from 'fs';
import admin from 'firebase-admin';
import router from "./routes/users.js";
import userRouter from "./routes/users.js";
import clienteRouter from "./routes/clients.js";
import permisoRouter from "./routes/permisos.js";
dotenv.config();

const app = express();
app.use(express.json());
const port = process.env.PORT || 3001;

// ---- MongoDB Client ----
const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
  },
});

// Conectar a MongoDB
async function connect() {
  try {
    // Connect Mongoose (used by models)
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set in environment');
    }
    mongoose.set('strictQuery', false);
    // Connect with default options. Explicit legacy options such as
    // `useNewUrlParser` and `useUnifiedTopology` are not supported
    // by the newer MongoDB driver and will cause a MongoParseError.
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Mongoose connected');

    // Also connect native MongoDB client if you still need it
    await client.connect();
    console.log('✅ MongoClient connected');
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error);
    process.exit(1);
  }
}

// Revisar conexión Endpoint
app.get('/', (req, res) => {
  res.send('Server is running!');
});

//Endpoints de Usuarios
app.use('/api/users', userRouter);
//Endpoints de Clientes
app.use('/api/clientes', clienteRouter);
// Endpoints de Permisos
app.use('/api/permisos', permisoRouter);


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



start();



