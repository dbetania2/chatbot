import fs from "fs";
import path from "path";
import { pipeline } from "@xenova/transformers";

// 1. cargar tu info base
const filePath = path.join(process.cwd(), "data/info.md");
const text = fs.readFileSync(filePath, "utf-8");

// 2. dividir en chunks (IMPORTANTE para calidad)
function chunkText(input, size = 400) {
  const chunks = [];
  for (let i = 0; i < input.length; i += size) {
    chunks.push(input.slice(i, i + size));
  }
  return chunks;
}

const chunks = chunkText(text);

// 3. modelo de embeddings liviano
const embedder = await pipeline(
  "feature-extraction",
  "Xenova/all-MiniLM-L6-v2"
);

const results = [];

for (const chunk of chunks) {
  const output = await embedder(chunk, {
    pooling: "mean",
    normalize: true,
  });

  results.push({
    text: chunk,
    embedding: Array.from(output.data),
  });
}

// 4. guardar archivo final
const outPath = path.join(process.cwd(), "data/embeddings.json");

fs.writeFileSync(outPath, JSON.stringify(results, null, 2));

console.log("✅ embeddings generados correctamente");