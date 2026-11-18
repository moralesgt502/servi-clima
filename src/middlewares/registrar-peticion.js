// src/middlewares/registrar-peticion.js
// Anota cada petición que entra al servidor.
export function registrarPeticion(req, res, next) {
    console.log(`${req.method} ${req.url}`);
    next();
}
