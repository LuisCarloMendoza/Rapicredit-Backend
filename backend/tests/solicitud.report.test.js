import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import request from 'supertest';
import solicitudRouter from '../routes/solicitudes.js';
import Cliente from '../models/cliente.model.js';
import Empleado from '../models/empleado.model.js';
import Solicitud from '../models/solicitud.model.js';
import fs from 'fs';

let mongod;
let app;

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
  // Clear DB
  const collections = await mongoose.connection.db.collections();
  for (let coll of collections) {
    await coll.deleteMany({});
  }

  // Seed cliente
  const cliente = new Cliente({
    codigoCliente: 'CLI-TEST-REPORT',
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
    nombre: 'Reporte',
    apellido: 'Cliente',
    email: 'report.cliente@test.com',
    telefono: ['+50499887766'],
    direccion: 'Calle X',
    sexo: 'Masculino',
    fechaNacimiento: '1990-05-12',
    limiteCredito: 15000,
    tasaCliente: 12.5,
    frecuenciaPago: 'Mensual',
    referencias: [],
    estadoDeuda: ['Al día'],
    garantias: [],
  });
  await cliente.save();

  // Seed user
  const user = new Empleado({
    uid: 'seed-uid',
    codigoUsuario: 'USR-REPORT',
    usuario: 'report_user',
    nombreCompleto: 'Report User',
    email: 'report.user@test.com',
    rol: 'Vendedor',
    telefono: '+50477777777',
    password: 'TestPass123!'
  });
  await user.save();

  // Seed solicitud aprobada
  const solicitud = new Solicitud({
    codigoSolicitud: 'SOL-REPORT-001',
    clienteId: cliente._id,
    vendedorId: user._id,
    capitalSolicitado: 10000,
    tasInteresId: new mongoose.Types.ObjectId(),
    frecuenciaPagoId: new mongoose.Types.ObjectId(),
    plazoCuotas: 12,
    fechaSolicitud: new Date(),
    finalidadCredito: 'Negocio',
    tablaAmortizacion: [{ periodo: 1, cuota: 888.88 }],
    cuotaEstimadaComision: { porcentaje: 0.02, monto: 200, cuotaAdicionalPorPeriodo: 16.67 },
    estadoSolicitud: 'APROBADA',
    usuarioCreacionId: user._id,
  });
  await solicitud.save();
});

test('POST /api/solicitudes/report/approved returns XLSX buffer', async () => {
  const res = await request(app)
    .post('/api/solicitudes/report/approved')
    .send({ frequency: 'monthly' })
    .buffer()
    .parse((res, cb) => {
      res.setEncoding('binary');
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => cb(null, Buffer.from(data, 'binary')));
    });

  expect(res.status).toBe(200);
  expect(res.headers['content-type']).toMatch(/application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet/);
  expect(res.body).toBeInstanceOf(Buffer);
  expect(res.body.length).toBeGreaterThan(100); // Basic sanity: not empty
});

test('GET /api/solicitudes/report/approved returns XLSX and writes file', async () => {
  const res = await request(app)
    .get('/api/solicitudes/report/approved?frequency=monthly')
    .buffer()
    .parse((res, cb) => {
      res.setEncoding('binary');
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => cb(null, Buffer.from(data, 'binary')));
    });

  expect(res.status).toBe(200);
  expect(res.headers['content-type']).toMatch(/application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet/);
  expect(res.body).toBeInstanceOf(Buffer);
  expect(res.body.length).toBeGreaterThan(100);

  const filePath = 'report_test_get.xlsx';
  fs.writeFileSync(filePath, res.body);
  expect(fs.existsSync(filePath)).toBe(true);
  const stats = fs.statSync(filePath);
  expect(stats.size).toBeGreaterThan(100);
  // cleanup
  fs.unlinkSync(filePath);
});
