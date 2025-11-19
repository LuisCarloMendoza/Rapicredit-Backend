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
var admin = require("firebase-admin");
var serviceAccount = require("./rapicredit-f52a2-firebase-adminsdk-fbsvc-34bfa26aa4.json"); 
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const auth = admin.auth();

/*
const firebaseConfig = {
    apiKey: "AIzaSyCuOdploMBF3E6SlB4_y_SfY3xniIfVseI",
    authDomain: "examen2-ux-c80b8.firebaseapp.com",
    projectId: "rapicredit-f52a2",
    storageBucket: "examen2-ux-c80b8.appspot.com",
    messagingSenderId: "579186092674",
    appId: "1:579186092674:web:2f863e07fca936e2bb629b",
    measurementId: "G-SQX3PKBWDP"
};*/

const firebaseApp = initializeApp(firebaseConfig);


// Comenzar el servidor
async function start() {
  await connect();
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
}

// ---- CRUD ENDPOINTS ----



start();



