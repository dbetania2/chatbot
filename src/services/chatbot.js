// archivo: services/chatbot.js

import { llm } from "../config/llm.js";
import { getRelevantContext } from "../embeddings/vectorStore.js";
import { buildPrompt } from "../prompts/systemPrompt.js";

export async function askBot(question) {
  try {
    // 1. limpieza y sanitizacion de la entrada
    const cleanQuestion = question?.trim().replace(/\s+/g, " ");

    // 2. validaciones estructuradas
    if (!cleanQuestion || cleanQuestion.length < 2) {
      return { error: "la pregunta esta vacia o es muy corta" };
    }

    if (cleanQuestion.length > 200) {
      return { error: "la pregunta excede el limite de 200 caracteres" };
    }

    // 3. busqueda de contexto en la base de datos vectorial
    const context = await getRelevantContext(cleanQuestion);

    // 4. construccion del prompt
    const messages = buildPrompt(context, cleanQuestion);

    // 5. llamada al modelo
    const response = await llm.invoke(messages);

    // 6. retorno profesional (objeto estructurado)
    return { success: true, data: response.content };

  } catch (error) {
    console.error("error critico en chatbot.js:", error);
    // devolvemos un formato predecible para el frontend
    return { error: "hubo un problema tecnico al procesar tu consulta" };
  }
}