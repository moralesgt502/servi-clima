// src/middlewares/permitir-origen.js
// CORS escrito a mano: autoriza al frontend a llamar a la API desde otro origen.
// En la sesión 6 se reemplaza por el paquete cors.
export function permitirOrigen(req, res, next) {
    const origen = req.get('Origin');
    const origenPermitido = process.env.ORIGEN_FRONTEND;
    if (origen && origen === origenPermitido) {
        res.set('Access-Control-Allow-Origin', origenPermitido);
        res.vary('Origin');
    }
    // Preflight: el navegador pregunta con OPTIONS antes de la petición real.
    // Se contesta 204 aquí y no sigue a las rutas.
    if (req.method === 'OPTIONS') {
        if (origen && origen !== origenPermitido) {
            return res.status(403).json({ error: 'Origen no permitido', detalles: [] });
        }
        res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.set('Access-Control-Max-Age', '600');
        return res.sendStatus(204);
    }
    next();
}

