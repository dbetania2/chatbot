// archivo: index.js

import "dotenv/config";
import app from "./api/server.js";
import { initVectorStore } from "./embeddings/vectorStore.js";

const PORT = process.env.PORT || 3000;

// evita que el servidor se caiga en silencio si hay un error grave
process.on("uncaughtException", (err) => {
  console.error("error critico no capturado:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("promesa fallida no manejada:", err);
  process.exit(1);
});

async function startServer() {
  try {
    console.log("iniciando sistema...");

    // precalentamiento: carga el archivo md y el modelo al arrancar
    // asi el primer reclutador que hable no sufre lentitud
    await initVectorStore();
    console.log("base de conocimiento lista");

    const server = app.listen(PORT, () => {
      console.log(`servidor corriendo en puerto ${PORT}`);
    });

    // apagado seguro: termina peticiones en curso antes de morir
    const gracefulShutdown = () => {
      console.log("apagando servidor de forma segura...");
      server.close(() => {
        console.log("servidor apagado");
        process.exit(0);
      });
    };

    process.on("SIGINT", gracefulShutdown);
    process.on("SIGTERM", gracefulShutdown);

  } catch (error) {
    console.error("error fatal al iniciar el servidor:", error);
    process.exit(1);
  }
}

startServer();