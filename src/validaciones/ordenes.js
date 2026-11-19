// src/validaciones/ordenes.js
// Esquema de una orden: una regla por campo.
// Cada regla recibe el valor y devuelve un mensaje si está mal, o null si está bien.
// Las reglas son las mismas que usa FormularioOrden.jsx en el frontend.
// id y codigo no están aquí: los asigna el servidor y si el cliente los envía se ignoran.

import { ESTADOS, DEPARTAMENTOS, CATEGORIAS } from '../catalogos.js';

// true si es texto con algo más que espacios
function esTextoConContenido(valor) {
    return typeof valor === 'string' && valor.trim() !== '';
}

function esFechaValida(valor) {
    if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
    const fecha = new Date(`${valor}T00:00:00.000Z`);
    return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor;
}

const reglas = {
    cliente: (valor) => {
        if (!esTextoConContenido(valor)) return 'El cliente es obligatorio';
        if (valor.length > 200) return 'El cliente no puede superar 200 caracteres';
        return null;
    },
    nit: (valor) => {
        // CF, o dígitos + guion opcional + dígito verificador (número o K)
        if (typeof valor !== 'string' || !/^(CF|\d{1,12}-?[\dK])$/.test(valor)) {
            return 'Formato de NIT: 1234567-8 o CF';
        }
        return null;
    },
    departamento: (valor) => {
        if (!DEPARTAMENTOS.includes(valor)) return 'Departamento no válido';
        return null;
    },
    categoria: (valor) => {
        if (!CATEGORIAS.includes(valor)) return 'Categoría no válida';
        return null;
    },
    tecnico: (valor) => {
        if (typeof valor === 'string' && valor.length > 120) return 'El técnico no puede superar 120 caracteres';
        if (!esTextoConContenido(valor)) return 'El técnico es obligatorio';
        return null;
    },
    fecha: (valor) => {
        // Formato del input type="date": 2026-11-11
        if (!esFechaValida(valor)) {
            return 'La fecha debe tener formato AAAA-MM-DD';
        }
        return null;
    },
    horas: (valor) => {
        // typeof rechaza "4": el número tiene que llegar como número
        if (typeof valor !== 'number' || !Number.isFinite(valor) || !(valor > 0 && valor <= 24)) {
            return 'Las horas deben ser un número mayor que 0 y hasta 24';
        }
        return null;
    },
    monto: (valor) => {
        if (typeof valor !== 'number' || !Number.isFinite(valor) || !(valor > 0)) {
            return 'El monto debe ser un número mayor que cero';
        }
        return null;
    },
    estado: (valor) => {
        if (!ESTADOS.includes(valor)) return `Estado no válido. Use: ${ESTADOS.join(', ')}`;
        return null;
    },
};

// Revisa los datos contra las reglas y devuelve:
//   limpios:  solo los campos del esquema (lo demás se ignora)
//   detalles: un { campo, mensaje } por cada campo inválido
// Con parcial: true (PATCH) solo se revisan los campos que vienen;
// sin parcial (POST y PUT) un campo que falta es un error.
export function validarOrden(datos, { parcial = false } = {}) {
    const limpios = {};
    const detalles = [];

    for (const campo in reglas) {
        const valor = datos[campo];

        // En PATCH, un campo que no viene no se revisa
        if (parcial && valor === undefined) continue;

        const mensaje = reglas[campo](valor);
        if (mensaje) {
            detalles.push({ campo, mensaje });
        } else {
            limpios[campo] = valor;
        }
    }

    return { limpios, detalles };
}
