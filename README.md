# API de Serviclima

API REST con Express y SQLite para las órdenes de servicio.

## Ejecutar localmente

Requiere Node.js 22.22.0 o superior en la versión 22, o Node.js 24.22.1 o superior en la versión 24.

```bash
npm ci
cp .env.example .env
npm run dev
```

En Windows PowerShell, si la política bloquea `npm`, usa `npm.cmd` en esos comandos. La API local queda en `http://localhost:3001`; `GET /health` confirma que está activa.

## Desplegar en Render

Crea un **Web Service** conectado al repositorio de esta API y configura:

| Campo | Valor |
| --- | --- |
| Runtime | Node |
| Build Command | `npm ci` |
| Start Command | `npm start` |
| Health Check Path | `/health` |

El archivo `.node-version` fija Node.js `24.22.1`. Render asigna `PORT` automáticamente. En **Environment**, agrega:

| Variable | Valor |
| --- | --- |
| `ORIGEN_FRONTEND` | Origen del frontend, por ejemplo `https://serviclima-web.onrender.com` (sin `/` final) |
| `DATABASE_PATH` | `/var/data/serviclima.db` |

### Persistencia de SQLite

Agrega un disco persistente con **Mount Path** `/var/data`. SQLite guardará ahí las órdenes. Sin ese disco, Render usa un sistema de archivos efímero y los cambios se pierden al reiniciar o desplegar el servicio. Los discos persistentes requieren un servicio Render de pago; para mantener un plan gratuito, migra la base a una base de datos administrada antes de almacenar datos que deban conservarse.

La base se inicializa desde `datos/db.json` solo cuando el archivo SQLite está vacío. El `.env` local no se sube; configura las variables desde el panel de Render.

## Pruebas

```bash
npm test
```
