import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import supabase from "../config/supabase.js";
import { createEmbeddings } from "../config/llm.js";

let _embeddings = null;
function getEmbeddings() {
  if (!_embeddings) _embeddings = createEmbeddings();
  return _embeddings;
}

export async function insertDocuments(docs) {
  if (!docs.length) return;

  const embeddings = getEmbeddings();


  let testVec;
  try {
    testVec = await embeddings.embedQuery(docs[0].pageContent);
  } catch (err) {
    throw Object.assign(
      new Error(
        `Embedding API call failed.\n` +
          `Check your GOOGLE_API_KEY / OPENAI_API_KEY in server/.env\n` +
          `Provider error: ${err.message}`,
      ),
      { status: 502 },
    );
  }

  if (!testVec || testVec.length === 0) {
    throw Object.assign(new Error("Embedding API returned an empty vector."), {
      status: 502,
    });
  }


  const texts = docs.map((d) => d.pageContent);
  const vectors = await embeddings.embedDocuments(texts);


  const rows = docs.map((doc, i) => ({
    content: doc.pageContent,
    metadata: doc.metadata,
    embedding: vectors[i],
    session_id: doc.metadata.session_id,
    source: doc.metadata.source,
    chunk_index: doc.metadata.chunk_index,
  }));


  const BATCH = 100;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from("documents").insert(batch);
    if (error) {
      throw Object.assign(
        new Error(`Error inserting batch: ${error.message}`),
        { status: 500 },
      );
    }
  }
}

export function getRetriever(sessionId, k) {
  const matchCount = k ?? parseInt(process.env.RAG_MATCH_COUNT || "6", 10);

  const store = new SupabaseVectorStore(getEmbeddings(), {
    client: supabase,
    tableName: "documents",
    queryName: "match_documents",
    filter: { session_id: sessionId },
  });

  return store.asRetriever({ k: matchCount, searchType: "similarity" });
}

export async function similaritySearch(query, sessionId, k) {
  const retriever = getRetriever(sessionId, k);
  return retriever.invoke(query);
}
