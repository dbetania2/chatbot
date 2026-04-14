// archivo: config/llm.js

import "dotenv/config";
import { ChatGroq } from "@langchain/groq";

// validacion de variable obligatoria
// usamos process.exit para que el servidor no intente arrancar roto
if (!process.env.GROQ_API_KEY) {
  console.error("error: falta groq_api_key en el .env");
  process.exit(1);
}

// instancia del modelo con configuracion de resiliencia
export const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  modelName: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  temperature: 0.2,
  maxTokens: 300,
  maxRetries: 3, // reintenta automaticamente si hay error de red
  clientOptions: {
    timeout: 20000, // 20 segundos de espera maxima
  }
});