import fs from "fs";
import path from "path";
import { pipeline } from "@xenova/transformers";

/**
 * 📦 CARGA SEGURA DE EMBEDDINGS (compatible con Vercel + Node ESM)
 */
const embeddingsData = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), "data/embeddings.json"),
    "utf-8"
  )
);

/**
 * 🔥 Lazy loader del modelo (evita cargarlo si no se usa)
 */
let embedderPromise = null;

async function getEmbedder() {
  if (!embedderPromise) {
    embedderPromise = pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }
  return embedderPromise;
}

/**
 * 📊 Cosine similarity (núcleo del sistema RAG)
 */
function cosineSimilarity(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * 🧠 CONTEXTO INTELIGENTE (REEMPLAZO FINAL DE VECTOR STORE)
 */
export async function getRelevantContext(question) {
  try {
    if (!question) return "";

    // 1. generar embedding del input
    const embedder = await getEmbedder();

    const output = await embedder(question, {
      pooling: "mean",
      normalize: true,
    });

    const queryEmbedding = Array.from(output.data);

    // 2. comparar contra embeddings precomputados
    const scored = embeddingsData.map((item) => ({
      text: item.text,
      score: cosineSimilarity(queryEmbedding, item.embedding),
    }));

    // 3. ordenar y devolver top 3
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((i) => i.text)
      .join("\n");

  } catch (error) {
    console.error("❌ Error en getRelevantContext:", error);
    return "";
  }
}