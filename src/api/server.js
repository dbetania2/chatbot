// archivo: api/server.js

import express from "express";
import cors from "cors";
import helmet from "helmet";
import { askBot } from "../services/chatbot.js";
import { limiter } from "../middleware/rateLimit.js";

const app = express();

/* ─────────────────────────────
   1. seguridad headers HTTP
───────────────────────────── */
app.use(helmet());

/* ─────────────────────────────
   2. CORS estricto (PRODUCCIÓN)
   - bloquea si no coincide exactamente
   - sin wildcard fallback
───────────────────────────── */
const allowedOrigin = process.env.CORS_ORIGIN;

app.use(
  cors({
    origin: (origin, callback) => {
      // permite requests sin origin (postman / server-to-server)
      if (!origin) return callback(null, false);

      // si no está configurado, bloquear todo
      if (!allowedOrigin) {
        return callback(new Error("CORS no configurado"), false);
      }

      // match exacto
      if (origin === allowedOrigin) {
        return callback(null, true);
      }

      // bloqueado
      return callback(new Error("Bloqueado por CORS"), false);
    },
    methods: ["POST"],
  })
);

/* ─────────────────────────────
   3. parseo JSON
───────────────────────────── */
app.use(express.json());

/* ─────────────────────────────
   4. endpoint chatbot
───────────────────────────── */
app.post("/chat", limiter, async (req, res) => {
  try {
    const { message } = req.body;

    // validación básica
    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        error: "mensaje invalido o vacio",
      });
    }

    // lógica del bot
    const result = await askBot(message);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    return res.json({
      success: true,
      data: result.data,
    });

  } catch (error) {
    console.error("error critico en endpoint /chat:", error);

    return res.status(500).json({
      success: false,
      error: "error interno del servidor",
    });
  }
});

export default app;