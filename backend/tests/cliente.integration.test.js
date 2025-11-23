import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import request from 'supertest';
import clienteRouter from '../routes/clients.js';

let mongod;
let app;

beforeAll(async () => {
  // Bind memory server to localhost to avoid 0.0.0.0 permission issues on some Windows setups
  mongod = await MongoMemoryServer.create({ instance: { ip: '127.0.0.1' } });
  const uri = mongod.getUri();
  // connect mongoose
  mongoose.set('strictQuery', false);
  await mongoose.connect(uri);

  // create express app and mount router under test
  app = express();
  app.use(express.json());
  app.use('/api/clientes', clienteRouter);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

beforeEach(async () => {
  // clean DB between tests
  const collections = await mongoose.connection.db.collections();
  for (let coll of collections) {
    await coll.deleteMany({});
  }
});

test('create cliente then update and fetch', async () => {
  const payload = {
    codigoCliente: 'CLI-001-A92F3',
    identidadCliente: '0801199901234',
    nacionalidad: 'Hondureña',
    RTN: '08011999012345',
    estadoCivil: 'Soltero',
    nivelEducativo: 'Secundaria',
    tipoVivienda: 'Propia',
    antiguedadVivenda: 5,
    numerosDependientes: [1, 2, 3],
    listadoDependientes: ['Hijo 1', 'Hijo 2', 'Hijo 3'],
    edadDependientes: [5, 8, 12],
    zonaResidencialCliente: 'Colonia Los Robles',
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan.perez@example.com',
    telefono: ['+50499887766', '+50488776655'],
    direccion: 'Residencial Las Uvas, Casa #23',
    sexo: 'Masculino',
    fechaNacimiento: '1990-05-12',
    limiteCredito: 15000,
    tasaCliente: 12.5,
    frecuenciaPago: 'Semanal',
    referencias: ['Maria López', 'Carlos García'],
    estadoDeuda: ['Al día'],
    garantias: ['Vehículo Toyota Corolla 2010', 'Juego de sala'],
    codigoCobrador: 'COB-204',
  };

  // Create
  const createRes = await request(app).post('/api/clientes').send(payload);
  expect(createRes.status).toBe(201);
  expect(createRes.body).toHaveProperty('codigoCliente', payload.codigoCliente);

  // Update (change nombre and try to change codigoCliente which should be ignored)
  const updatePayload = { ...payload, nombre: 'Juan Actualizado', codigoCliente: 'SHOULD-NOT-CHANGE' };
  const updateRes = await request(app).put(`/api/clientes/${payload.codigoCliente}`).send(updatePayload);
  expect(updateRes.status).toBe(200);
  expect(updateRes.body).toHaveProperty('nombre', 'Juan Actualizado');
  // codigoCliente must remain the original value
  expect(updateRes.body).toHaveProperty('codigoCliente', payload.codigoCliente);

  // Fetch and assert
  const getRes = await request(app).get(`/api/clientes/${payload.codigoCliente}`);
  expect(getRes.status).toBe(200);
  expect(getRes.body).toHaveProperty('nombre', 'Juan Actualizado');
  expect(getRes.body).toHaveProperty('email', payload.email);
});

test('creating duplicate codigoCliente returns 400', async () => {
  const payload = {
    codigoCliente: 'CLI-001-DUP',
    identidadCliente: '0801199909999',
    nacionalidad: 'Hondureña',
    RTN: '08011999099999',
    estadoCivil: 'Soltero',
    nivelEducativo: 'Secundaria',
    tipoVivienda: 'Propia',
    antiguedadVivenda: 1,
    numerosDependientes: [0],
    listadoDependientes: [],
    edadDependientes: [],
    zonaResidencialCliente: 'Zona X',
    nombre: 'Ana',
    apellido: 'Lopez',
    email: 'ana.lopez@example.com',
    telefono: ['+50490000000'],
    direccion: 'Direccion X',
    sexo: 'Femenino',
    fechaNacimiento: '1992-01-01',
    limiteCredito: 0,
    tasaCliente: 0,
    frecuenciaPago: 'Mensual',
    referencias: [],
    estadoDeuda: ['Al día'],
    garantias: [],
  };

  const res1 = await request(app).post('/api/clientes').send(payload);
  expect(res1.status).toBe(201);

  const res2 = await request(app).post('/api/clientes').send(payload);
  expect(res2.status).toBe(400);
  expect(res2.body).toHaveProperty('message');
  // message should indicate duplicate codigoCliente or unique constraint
  expect(res2.body.message.toLowerCase()).toMatch(/already exists|duplicate|unique/);
});

test('creation with missing required fields returns 400', async () => {
  // omit identidadCliente and email which are required
  const badPayload = {
    codigoCliente: 'CLI-001-BAD',
    nacionalidad: 'Hondureña',
    RTN: '08011999011111',
    estadoCivil: 'Soltero',
    nivelEducativo: 'Secundaria',
    tipoVivienda: 'Propia',
    antiguedadVivenda: 2,
    numerosDependientes: [],
    listadoDependientes: [],
    edadDependientes: [],
    zonaResidencialCliente: 'Zona Y',
    nombre: 'Pedro',
    apellido: 'Gomez',
    telefono: ['+50491111111'],
    direccion: 'Direccion Y',
    sexo: 'Masculino',
    fechaNacimiento: '1988-03-03',
    limiteCredito: 0,
    tasaCliente: 0,
    frecuenciaPago: 'Mensual',
    estadoDeuda: ['Al día'],
  };

  const res = await request(app).post('/api/clientes').send(badPayload);
  expect(res.status).toBe(400);
  expect(res.body).toHaveProperty('message');
  expect(res.body.message.toLowerCase()).toMatch(/validation failed|required/);
});

test('updating non-existent cliente returns 400', async () => {
  const updatePayload = { nombre: 'NoExist' };
  const res = await request(app).put('/api/clientes/NON-EXISTENT').send(updatePayload);
  expect(res.status).toBe(400);
  expect(res.body).toHaveProperty('message');
  expect(res.body.message.toLowerCase()).toMatch(/does not exist|not exist/);
});
