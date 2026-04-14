// archivo: embeddings/vectorStore.js

import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";

// usamos una promesa para bloquear cargas simultaneas
let vectorStorePromise = null;

export async function initVectorStore() {
  if (vectorStorePromise) return vectorStorePromise;

  vectorStorePromise = (async () => {
    try {
      const loader = new TextLoader("data/info.md");
      const docs = await loader.load();

      // el splitter de markdown respeta tablas, listas y parrafos
      const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
        chunkSize: 500,
        chunkOverlap: 50,
      });

      const splitDocs = await splitter.splitDocuments(docs);

      // definimos el modelo exacto para evitar descargas innecesarias o pesadas
      const embeddings = new HuggingFaceTransformersEmbeddings({
        modelName: "Xenova/all-MiniLM-L6-v2",
      });

      const store = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);
      return store;

    } catch (error) {
      console.error("error inicializando embeddings:", error);
      vectorStorePromise = null; // reseteamos si falla para que pueda reintentar
      throw new Error("error al cargar la base de conocimiento");
    }
  })();

  return vectorStorePromise;
}

export async function getRelevantContext(question) {
  try {
    if (!question) return "";

    const store = await initVectorStore();

    // trae los 3 mejores resultados con su puntaje de similitud
    const results = await store.similaritySearchWithScore(question, 3);

    if (!results || results.length === 0) return "";

    // filtramos resultados basandonos en la distancia (evita alucinaciones si preguntan algo random)
    // el umbral depende del modelo, ajustalo si ves que descarta info util
    const validContexts = results
      .filter(([doc, score]) => score > 0.5) 
      .map(([doc]) => doc.pageContent);

    return validContexts.join("\n");

  } catch (error) {
    console.error("error al buscar contexto:", error);
    return "";
  }
}