// archivo: src/index.js

import "dotenv/config";
import app from "./api/server.js";
import { initVectorStore } from "./embeddings/vectorStore.js";

// inicialización segura por request (serverless friendly)
app.use(async (req, res, next) => {
  try {
    // siempre aseguramos que esté listo
    await initVectorStore();
    next();
  } catch (error) {
    console.error("Error al inicializar vector store:", error);

    return res.status(500).json({
      success: false,
      error: "Error de inicialización interno"
    });
  }
});

// export para vercel
export default app;

// local dev
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Servidor local en http://localhost:${PORT}`);
  });
}