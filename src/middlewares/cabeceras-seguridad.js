export function cabecerasSeguridad(req, res, next) {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');
    res.set('Referrer-Policy', 'no-referrer');
    res.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    if (req.secure) {
        res.set('Strict-Transport-Security', 'max-age=15552000');
    }

    next();
}
