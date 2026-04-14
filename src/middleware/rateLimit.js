// archivo: middleware/rateLimit.js

import rateLimit from "express-rate-limit";

// usamos el env para cambiar el limite facil en produccion, 
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX) || 5;

export const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: maxRequests,
  standardHeaders: true, // envia los headers estandar de limite de uso
  legacyHeaders: false, // desactiva headers viejos
  // manejador personalizado para devolver un json en lugar de un string
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: "demasiadas consultas al bot. por favor, espera un minuto y vuelve a intentar."
    });
  }
});