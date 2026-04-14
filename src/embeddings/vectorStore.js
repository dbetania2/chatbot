import path from "path";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";

let vectorStorePromise = null;

export async function initVectorStore() {
  if (vectorStorePromise) return vectorStorePromise;

  vectorStorePromise = (async () => {
    try {
      // ✅ FIX CRÍTICO: path absoluto compatible con Vercel
      const filePath = path.join(process.cwd(), "data/info.md");

      const loader = new TextLoader(filePath);
      const docs = await loader.load();

      const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
        chunkSize: 500,
        chunkOverlap: 50,
      });

      const splitDocs = await splitter.splitDocuments(docs);

      const embeddings = new HuggingFaceTransformersEmbeddings({
        modelName: "Xenova/all-MiniLM-L6-v2",
      });

      const store = await MemoryVectorStore.fromDocuments(
        splitDocs,
        embeddings
      );

      return store;

    } catch (error) {
      console.error("❌ Error inicializando vector store:", error);

      // reset para reintento limpio
      vectorStorePromise = null;

      throw error;
    }
  })();

  return vectorStorePromise;
}

export async function getRelevantContext(question) {
  try {
    if (!question) return "";

    const store = await initVectorStore();

    const results = await store.similaritySearchWithScore(question, 3);

    if (!results || results.length === 0) return "";

    const validContexts = results
      .filter(([doc, score]) => score > 0.5)
      .map(([doc]) => doc.pageContent);

    return validContexts.join("\n");

  } catch (error) {
    console.error("❌ Error al buscar contexto:", error);
    return "";
  }
}