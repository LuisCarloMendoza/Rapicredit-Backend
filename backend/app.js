// app.js
require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
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
    await client.connect();
    console.log('✅ Conectado a la base de datos');
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error);
    process.exit(1);
  }
}

// Revisar conexión Endpoint
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Firebase Admin SDK

// Comenzar el servidor
async function start() {
  await connect();
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
}

// ---- CRUD ENDPOINTS ----


start();



