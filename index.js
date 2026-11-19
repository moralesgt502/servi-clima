// index.js
// Punto de entrada de serviclima-api: arma la aplicación y la pone a escuchar.
// Ya no tiene rutas ni datos: eso vive en src/.
// Antes de ejecutar: copie .env.example como .env
// Ejecute: npm run dev

import express from 'express';
import rutasOrdenes from './src/rutas/ordenes.js';
import rutasCatalogos from './src/rutas/catalogos.js';
import rutasResumen from './src/rutas/resumen.js';
import { registrarPeticion } from './src/middlewares/registrar-peticion.js';
import { cabecerasSeguridad } from './src/middlewares/cabeceras-seguridad.js';
import { limitarPeticiones } from './src/middlewares/limitar-peticiones.js';
import { permitirOrigen } from './src/middlewares/permitir-origen.js';
import { noEncontrado } from './src/middlewares/no-encontrado.js';
import { manejarErrores } from './src/middlewares/manejar-errores.js';
import { db } from './src/db.js';

const PUERTO = process.env.PORT ?? process.env.PUERTO ?? 3001;
if (!process.env.ORIGEN_FRONTEND) {
    throw new Error('Falta configurar ORIGEN_FRONTEND con el origen permitido del frontend');
}
let origenConfigurado;
try {
    origenConfigurado = new URL(process.env.ORIGEN_FRONTEND);
} catch {
    throw new Error('ORIGEN_FRONTEND debe ser una URL de origen válida, sin ruta');
}
if (origenConfigurado.origin !== process.env.ORIGEN_FRONTEND) {
    throw new Error('ORIGEN_FRONTEND debe contener solo el origen, sin ruta ni barra final');
}
if (process.env.NODE_ENV === 'production') {
    if (origenConfigurado.protocol !== 'https:') {
        throw new Error('ORIGEN_FRONTEND debe usar HTTPS en producción');
    }
    if (!process.env.DATABASE_PATH) {
        throw new Error('Configure DATABASE_PATH en producción para evitar guardar SQLite en disco efímero');
    }
}
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : false);

// Middlewares antes de las rutas, en el orden en que corren
app.use(registrarPeticion); // 1. anota cada petición
app.use(permitirOrigen);    // 2. CORS para el frontend
app.use(cabecerasSeguridad);
app.use(limitarPeticiones);
app.use(express.json({ limit: '32kb' }));

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// Rutas
app.use('/ordenes', rutasOrdenes);
app.use(rutasCatalogos); // /departamentos y /categorias
app.use(rutasResumen);   // /resumen

// Middlewares después de las rutas
app.use(noEncontrado);   // 4. ninguna ruta atendió: 404
app.use(manejarErrores); // 5. siempre el último

const servidor = app.listen(PUERTO, '0.0.0.0', () => {
    console.log(`API de Serviclima en http://localhost:${PUERTO}`);
    console.log(`Origen permitido: ${process.env.ORIGEN_FRONTEND}`);
});

function cerrarServidor(signal) {
    console.log(`Recibida señal ${signal}; cerrando el servidor`);
    servidor.close(() => {
        db.close();
        process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
}

process.once('SIGTERM', () => cerrarServidor('SIGTERM'));
process.once('SIGINT', () => cerrarServidor('SIGINT'));
