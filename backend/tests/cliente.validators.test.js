import { clienteService } from '../services/cliente.service.js';

describe('clienteService validators', () => {
  test('_isValidEmail accepts valid emails and rejects invalid ones', () => {
    expect(clienteService._isValidEmail('user@example.com')).toBe(true);
    expect(clienteService._isValidEmail('user.name+tag@sub.domain.co')).toBe(true);
    expect(clienteService._isValidEmail('not-an-email')).toBe(false);
    expect(clienteService._isValidEmail('')).toBe(false);
    expect(clienteService._isValidEmail(null)).toBe(false);
  });

  test('_isValidDate accepts valid date-like values and rejects invalid ones', () => {
    expect(clienteService._isValidDate('1990-01-01')).toBe(true);
    expect(clienteService._isValidDate(new Date())).toBe(true);
    expect(clienteService._isValidDate('invalid-date')).toBe(false);
    expect(clienteService._isValidDate(null)).toBe(false);
  });

  test('_validateCreateData passes for a valid payload', () => {
    const good = {
      codigoCliente: 'CLI-UT-1',
      identidadCliente: '0801199901234',
      nacionalidad: 'Hondureña',
      RTN: '08011999012345',
      estadoCivil: 'Soltero',
      nivelEducativo: 'Secundaria',
      tipoVivienda: 'Propia',
      antiguedadVivenda: 5,
      numerosDependientes: [1],
      listadoDependientes: ['Hijo 1'],
      edadDependientes: [5],
      zonaResidencialCliente: 'Colonia',
      nombre: 'Nombre',
      apellido: 'Apellido',
      email: 'test@example.com',
      telefono: ['+50490000000'],
      direccion: 'Direccion',
      sexo: 'Masculino',
      fechaNacimiento: '1990-05-12',
      frecuenciaPago: 'Semanal',
      estadoDeuda: ['Al día']
    };
    expect(() => clienteService._validateCreateData(good)).not.toThrow();
  });

  test('_validateCreateData throws for missing required fields', () => {
    const bad = {
      // missing identidadCliente and email
      codigoCliente: 'CLI-UT-2',
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
      frecuenciaPago: 'Mensual',
      estadoDeuda: ['Al día'],
    };
    expect(() => clienteService._validateCreateData(bad)).toThrow(/Missing required fields/i);
  });

  test('_validateCreateData rejects invalid email and bad types', () => {
    const badEmail = {
      codigoCliente: 'CLI-UT-3', identidadCliente: 'id3', nacionalidad: 'X', RTN: 'rtn3',
      estadoCivil: 'S', nivelEducativo: 'N', tipoVivienda: 'V', antiguedadVivenda: 1,
      numerosDependientes: [], listadoDependientes: [], edadDependientes: [], zonaResidencialCliente: 'Z',
      nombre: 'N', apellido: 'A', email: 'not-an-email', telefono: ['+504'], direccion: 'D',
      sexo: 'M', fechaNacimiento: '1990-01-01', frecuenciaPago: 'F', estadoDeuda: ['Al día']
    };
    expect(() => clienteService._validateCreateData(badEmail)).toThrow(/Invalid email format/i);

    const badTypes = { ...badEmail, email: 'ok@example.com', fechaNacimiento: 'invalid-date' };
    expect(() => clienteService._validateCreateData(badTypes)).toThrow(/Invalid fechaNacimiento/i);
  });

  test('_validateUpdateData allows simple updates and rejects codigoCliente in payload', () => {
    expect(() => clienteService._validateUpdateData({ nombre: 'Nuevo' })).not.toThrow();
    expect(() => clienteService._validateUpdateData({ codigoCliente: 'SHOULD' })).toThrow(/codigoCliente cannot be updated/i);
    expect(() => clienteService._validateUpdateData({ email: 'bad-email' })).toThrow(/Invalid email format/i);
  });
});

