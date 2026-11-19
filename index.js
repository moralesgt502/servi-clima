
// index.js
// Punto de entrada de serviclima-api: configura la aplicación y la pone a escuchar.
// Las rutas, middlewares y conexión a la base de datos están organizados en src/.
//
// Ejecutar localmente: npm run dev
// Despliegue: Render

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

// Puerto proporcionado por Render o utilizado localmente.
const PUERTO = process.env.PORT || 3001;

// Configuración de Express.
const app = express();

app.disable('x-powered-by');

app.set(
    'trust proxy',
    process.env.NODE_ENV === 'production' ? 1 : false
);

// Middlewares antes de las rutas.
app.use(registrarPeticion);
app.use(permitirOrigen);
app.use(cabecerasSeguridad);
app.use(limitarPeticiones);
app.use(express.json({ limit: '32kb' }));

// Ruta para comprobar que la API está funcionando.
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Rutas de la API.
app.use('/ordenes', rutasOrdenes);
app.use(rutasCatalogos);
app.use(rutasResumen);

// Manejo de rutas no encontradas y errores.
app.use(noEncontrado);
app.use(manejarErrores);

// Inicio del servidor.
const servidor = app.listen(PUERTO, '0.0.0.0', () => {
    console.log(`API de Serviclima funcionando en el puerto ${PUERTO}`);
});

// Cierre controlado del servidor.
function cerrarServidor(signal) {
    console.log(`Recibida señal ${signal}; cerrando el servidor`);

    servidor.close(() => {
        db.close();
        console.log('Servidor y conexión a la base de datos cerrados');
        process.exit(0);
    });

    setTimeout(() => {
        console.error('Tiempo de espera agotado al cerrar el servidor');
        process.exit(1);
    }, 10000).unref();
}

// Escuchar señales de cierre.
process.once('SIGTERM', () => cerrarServidor('SIGTERM'));
process.once('SIGINT', () => cerrarServidor('SIGINT'));
