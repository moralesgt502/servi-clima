# API de Serviclima

API REST con Express y SQLite para las órdenes de servicio.

## Desarrollo local

Requiere Node.js 22.22 o 24.22.1 (o superior dentro de esas versiones mayores).

```bash
npm ci
cp .env.example .env
npm run dev
```

La API local escucha en `http://localhost:3001`. `GET /health` devuelve el estado del servicio.

## Despliegue del backend en Render

Crea un Web Service conectado al repositorio de este backend y configura:

| Configuración | Valor |
| --- | --- |
| Runtime | Node |
| Build Command | `npm ci` |
| Start Command | `npm start` |
| Health Check Path | `/health` |

El archivo `.node-version` fija Node.js `24.22.1`. En el panel de Environment configura:

| Variable | Valor |
| --- | --- |
| `NODE_ENV` | `production` |
| `ORIGEN_FRONTEND` | Origen HTTPS exacto del frontend, sin ruta ni barra final |
| `DATABASE_PATH` | `/var/data/serviclima.db` |

Agrega un disco persistente con Mount Path `/var/data`. Sin él, Render usa almacenamiento efímero y las órdenes se pierden al reiniciar o desplegar. Los discos persistentes requieren un servicio de pago; si se necesita un plan gratuito, migra a una base administrada. SQLite requiere mantener una sola instancia del backend.

El backend inicializa una base vacía desde `datos/db.json`. No ejecutes `npm run reiniciar-db` en producción: borra todas las órdenes y vuelve a cargar los datos iniciales.

## Seguridad y alcance

La API valida los datos, limita solicitudes por IP, restringe CORS al origen configurado, añade cabeceras de seguridad y limita los cuerpos JSON. El límite de solicitudes vive en memoria y está pensado para una sola instancia.

**La API todavía no tiene autenticación ni autorización.** CORS no protege la API de clientes directos. Antes de usarla con datos reales de clientes, incorpora inicio de sesión y permisos para las operaciones de lectura y escritura.

## Verificación

```bash
npm test
```
