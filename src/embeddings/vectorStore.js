// archivo: embeddings/vectorStore.js

import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";

let vectorStorePromise = null;

export async function initVectorStore() {
  if (vectorStorePromise) return vectorStorePromise;

  vectorStorePromise = (async () => {
    try {
      const loader = new TextLoader("data/info.md");
      const docs = await loader.load();

      const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
        chunkSize: 500,
        chunkOverlap: 50,
      });

      const splitDocs = await splitter.splitDocuments(docs);

      const embeddings = new HuggingFaceTransformersEmbeddings({
        modelName: "Xenova/all-MiniLM-L6-v2",
      });

      return await MemoryVectorStore.fromDocuments(splitDocs, embeddings);

    } catch (error) {
      console.error("Error inicializando vector store:", error);

      // reset para reintento seguro
      vectorStorePromise = null;

      throw error;
    }
  })();

  return vectorStorePromise;
}