import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import request from 'supertest';
import solicitudRouter from '../routes/solicitudes.js';
import Cliente from '../models/cliente.model.js';
import Solicitud from '../models/solicitud.model.js';

let mongod;
let app;
let clienteId;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create({ instance: { ip: '127.0.0.1' } });
  const uri = mongod.getUri();
  mongoose.set('strictQuery', false);
  await mongoose.connect(uri);

  app = express();
  app.use(express.json());
  app.use('/api/solicitudes', solicitudRouter);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

beforeEach(async () => {
  // limpiar BD
  const collections = await mongoose.connection.db.collections();
  for (let coll of collections) {
    await coll.deleteMany({});
  }

  // crear cliente de prueba
  const cliente = new Cliente({
    codigoCliente: 'CLI-TEST-001',
    identidadCliente: '0801199901234',
    nacionalidad: 'Hondureña',
    RTN: '08011999012345',
    estadoCivil: 'Soltero',
    nivelEducativo: 'Secundaria',
    tipoVivienda: 'Propia',
    antiguedadVivenda: 5,
    numerosDependientes: [1],
    listadoDependientes: ['Hijo'],
    edadDependientes: [5],
    zonaResidencialCliente: 'Colonia X',
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan.perez@test.com',
    telefono: ['+50499887766'],
    direccion: 'Calle X',
    sexo: 'Masculino',
    fechaNacimiento: '1990-05-12',
    limiteCredito: 15000,
    tasaCliente: 12.5,
    frecuenciaPago: 'Semanal',
    referencias: [],
    estadoDeuda: ['Al día'],
    garantias: [],
  });
  await cliente.save();
  clienteId = cliente._id.toString();
});

test('create solicitud, update, fetch and change status', async () => {
  const payload = {
    codigoSolicitud: 'SOL-001-ABC123',
    clienteId,
    vendedorId: new mongoose.Types.ObjectId().toString(),
    capitalSolicitado: 5000,
    tasInteresId: new mongoose.Types.ObjectId().toString(),
    frecuenciaPagoId: new mongoose.Types.ObjectId().toString(),
    plazoCuotas: 12,
    finalidadCredito: 'Negocio',
    datosNegocio: { nombre: 'Mi Negocio', giro: 'Comercio' },
    usuarioCreacionId: new mongoose.Types.ObjectId().toString(),
  };

  // Create
  const createRes = await request(app).post('/api/solicitudes').send(payload);
  expect(createRes.status).toBe(201);
  expect(createRes.body).toHaveProperty('codigoSolicitud', payload.codigoSolicitud);
  expect(createRes.body).toHaveProperty('estadoSolicitud', 'REGISTRADA');

  // Update
  const updatePayload = { finalidadCredito: 'Vivienda' };
  const updateRes = await request(app).put(`/api/solicitudes/${payload.codigoSolicitud}`).send(updatePayload);
  expect(updateRes.status).toBe(200);
  expect(updateRes.body).toHaveProperty('finalidadCredito', 'Vivienda');

  // Fetch
  const getRes = await request(app).get(`/api/solicitudes/${payload.codigoSolicitud}`);
  expect(getRes.status).toBe(200);
  expect(getRes.body).toHaveProperty('finalidadCredito', 'Vivienda');

  // Change status
  const statusRes = await request(app)
    .patch(`/api/solicitudes/${payload.codigoSolicitud}/status`)
    .send({
      estadoSolicitud: 'APROBADA',
      usuarioDecisionId: new mongoose.Types.ObjectId().toString(),
      observaciones: 'Aprobada',
    });
  expect(statusRes.status).toBe(200);
  expect(statusRes.body).toHaveProperty('estadoSolicitud', 'APROBADA');
});

test('creating duplicate codigoSolicitud returns 400', async () => {
  const payload = {
    codigoSolicitud: 'SOL-DUP-001',
    clienteId,
    vendedorId: new mongoose.Types.ObjectId().toString(),
    capitalSolicitado: 3000,
    tasInteresId: new mongoose.Types.ObjectId().toString(),
    frecuenciaPagoId: new mongoose.Types.ObjectId().toString(),
    plazoCuotas: 6,
    finalidadCredito: 'Negocio',
    usuarioCreacionId: new mongoose.Types.ObjectId().toString(),
  };

  const res1 = await request(app).post('/api/solicitudes').send(payload);
  expect(res1.status).toBe(201);

  const res2 = await request(app).post('/api/solicitudes').send(payload);
  expect(res2.status).toBe(400);
  expect(res2.body.message.toLowerCase()).toMatch(/already exists|duplicate|unique/);
});

test('filter solicitudes by cliente and estado', async () => {
  const base = {
    vendedorId: new mongoose.Types.ObjectId().toString(),
    capitalSolicitado: 4000,
    tasInteresId: new mongoose.Types.ObjectId().toString(),
    frecuenciaPagoId: new mongoose.Types.ObjectId().toString(),
    plazoCuotas: 6,
    finalidadCredito: 'Negocio',
    usuarioCreacionId: new mongoose.Types.ObjectId().toString(),
  };

  await request(app).post('/api/solicitudes').send({ ...base, codigoSolicitud: 'S1', clienteId, estadoSolicitud: 'REGISTRADA' });
  await request(app).post('/api/solicitudes').send({ ...base, codigoSolicitud: 'S2', clienteId, estadoSolicitud: 'APROBADA' });

  const resCliente = await request(app).get(`/api/solicitudes?clienteId=${clienteId}`);
  expect(resCliente.status).toBe(200);
  expect(Array.isArray(resCliente.body)).toBe(true);
  expect(resCliente.body.length).toBeGreaterThanOrEqual(2);

  const resEstado = await request(app).get(`/api/solicitudes/estado/APROBADA`);
  expect(resEstado.status).toBe(200);
  expect(Array.isArray(resEstado.body)).toBe(true);
  expect(resEstado.body.some(s => s.codigoSolicitud === 'S2')).toBe(true);
});