// archivo: src/index.js

import "dotenv/config";
import app from "./api/server.js";
import { initVectorStore } from "./embeddings/vectorStore.js";

// IMPORTANTE: En Vercel, la inicialización debe ser manejada con cuidado
// porque las funciones son efímeras.
let isStoreInitialized = false;

async function ensureInitialized() {
  if (!isStoreInitialized) {
    await initVectorStore();
    isStoreInitialized = true;
    console.log("Base de conocimiento cargada en la instancia");
  }
}

// Middleware para asegurar que el VectorStore esté listo antes de procesar
app.use(async (req, res, next) => {
  try {
    await ensureInitialized();
    next();
  } catch (error) {
    console.error("Error al inicializar store:", error);
    res.status(500).json({ success: false, error: "Error de inicialización interno" });
  }
});

// Exportamos la app para que Vercel la maneje
export default app;

// Mantenemos esto solo para desarrollo local (no afectará a Vercel)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor local corriendo en http://localhost:${PORT}`);
  });
}