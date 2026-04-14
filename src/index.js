import "dotenv/config";
import app from "./api/server.js";

/**
 * 🚀 ENTRY POINT LIMPIO PARA VERCEL
 * - Sin init de embeddings
 * - Sin vector store en runtime
 * - Compatible con serverless
 */

// export para Vercel
export default app;

/**
 * 🧪 SOLO DESARROLLO LOCAL
 */
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`🚀 Servidor local en http://localhost:${PORT}`);
  });
}