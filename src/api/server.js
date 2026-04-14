// archivo: api/server.js

import express from "express";
import cors from "cors";
import helmet from "helmet";
import { askBot } from "../services/chatbot.js";
import { limiter } from "../middleware/rateLimit.js";

const app = express();

// 1. seguridad: protege cabeceras http
app.use(helmet());

// 2. seguridad: configura cors (en produccion, cambia "*" por la url de tu portfolio)
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["POST"]
}));

// 3. utilidad: parseo de json en body
app.use(express.json());

// 4. endpoint protegido con el limitador de requests
app.post("/chat", limiter, async (req, res) => {
  try {
    const { message } = req.body;

    // validacion basica antes de gastar recursos
    if (!message || typeof message !== "string") {
      return res.status(400).json({ 
        success: false, 
        error: "mensaje invalido o vacio" 
      });
    }

    // llamada al orquestador
    const result = await askBot(message);

    // si el bot detecta un error (ej. pregunta muy larga)
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    // respuesta exitosa para el frontend
    return res.json({ 
      success: true, 
      data: result.data 
    });

  } catch (error) {
    console.error("error critico en endpoint /chat:", error);
    
    // error general del servidor
    return res.status(500).json({
      success: false,
      error: "error interno del servidor"
    });
  }
});

export default app;