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

test('acepta una orden válida', () => {
    assert.deepEqual(validarOrden(ordenValida).detalles, []);
});

test('rechaza fechas imposibles y montos no finitos', () => {
    const resultado = validarOrden({ ...ordenValida, fecha: '2026-02-30', monto: Infinity });
    assert.deepEqual(resultado.detalles.map(({ campo }) => campo), ['fecha', 'monto']);
});

test('rechaza nombres que exceden los límites admitidos', () => {
    const resultado = validarOrden({ ...ordenValida, cliente: 'x'.repeat(201), tecnico: 'y'.repeat(121) });
    assert.deepEqual(resultado.detalles.map(({ campo }) => campo), ['cliente', 'tecnico']);
});

test('PATCH valida solo los campos enviados', () => {
    const resultado = validarOrden({ estado: 'completada', ignorado: true }, { parcial: true });
    assert.deepEqual(resultado.detalles, []);
    assert.deepEqual(resultado.limpios, { estado: 'completada' });
});
