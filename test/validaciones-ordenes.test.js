import test from 'node:test';
import assert from 'node:assert/strict';
import { validarOrden } from '../src/validaciones/ordenes.js';

const ordenValida = {
    cliente: 'Taller Central',
    nit: '1234567-8',
    departamento: 'Guatemala',
    categoria: 'Diagnóstico',
    tecnico: 'Ana Chacón',
    fecha: '2026-11-18',
    horas: 3.5,
    monto: 750,
    estado: 'pendiente',
};

test('acepta una orden completa y válida', () => {
    const resultado = validarOrden(ordenValida);

    assert.deepEqual(resultado.detalles, []);
    assert.deepEqual(resultado.limpios, ordenValida);
});

test('informa los campos obligatorios o inválidos', () => {
    const resultado = validarOrden({ ...ordenValida, cliente: '  ', nit: 'invalido', horas: 25 });

    assert.deepEqual(resultado.detalles, [
        { campo: 'cliente', mensaje: 'El cliente es obligatorio' },
        { campo: 'nit', mensaje: 'Formato de NIT: 1234567-8 o CF' },
        { campo: 'horas', mensaje: 'Las horas deben ser un número mayor que 0 y hasta 24' },
    ]);
});

test('en una actualización parcial acepta únicamente los campos enviados', () => {
    const resultado = validarOrden({ estado: 'completada', codigo: 'OS-2026-001' }, { parcial: true });

    assert.deepEqual(resultado.detalles, []);
    assert.deepEqual(resultado.limpios, { estado: 'completada' });
});
