const VENTANA_MS = 15 * 60 * 1000;
const MAX_PETICIONES = 120;
const MAX_CLIENTES = 20_000;
const clientes = new Map();

function limpiarExpirados(ahora) {
    for (const [ip, registro] of clientes) {
        if (registro.renueva <= ahora) clientes.delete(ip);
    }
}

export function limitarPeticiones(req, res, next) {
    if (req.path === '/health') return next();

    const ahora = Date.now();
    const ip = req.ip || req.socket.remoteAddress || 'desconocido';
    let registro = clientes.get(ip);

    if (!registro || registro.renueva <= ahora) {
        if (clientes.size >= MAX_CLIENTES) limpiarExpirados(ahora);
        if (clientes.size >= MAX_CLIENTES) {
            return res.status(429).json({
                error: 'Se alcanzó el límite temporal de clientes',
                detalles: [],
            });
        }
        registro = { peticiones: 0, renueva: ahora + VENTANA_MS };
        clientes.set(ip, registro);
    }

    registro.peticiones += 1;
    const restantes = Math.max(0, MAX_PETICIONES - registro.peticiones);
    res.set('RateLimit-Limit', String(MAX_PETICIONES));
    res.set('RateLimit-Remaining', String(restantes));
    res.set('RateLimit-Reset', String(Math.ceil(registro.renueva / 1000)));

    if (registro.peticiones > MAX_PETICIONES) {
        res.set('Retry-After', String(Math.max(1, Math.ceil((registro.renueva - ahora) / 1000))));
        return res.status(429).json({
            error: 'Demasiadas solicitudes. Intente de nuevo más tarde',
            detalles: [],
        });
    }

    next();
}
