import supabase from "../config/supabase.js";
import { chunkAll } from "./chunker.js";
import { insertDocuments, similaritySearch } from "./vectorStore.js";
import { createLLM } from "../config/llm.js";
import { Document } from "@langchain/core/documents";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

let _llm = null;
function getLLM() {
  if (!_llm) _llm = createLLM();
  return _llm;
}
async function createSession({ fileName, fileSizeKb, pageCount }) {
  const { data, error } = await supabase
    .from("interview_sessions")
    .insert({
      file_name: fileName,
      file_size_kb: fileSizeKb,
      page_count: pageCount,
    })
    .select("id")
    .single();

  if (error)
    throw Object.assign(
      new Error(`Failed to create session: ${error.message}`),
      { status: 500 },
    );
  return data.id;
}

export async function ingestDocuments({ resumeText, jobDescription, meta }) {
  const sessionId = await createSession(meta);
  const { resumeDocs, jdDocs, total } = await chunkAll({
    resumeText,
    jobDescription,
    sessionId,
  });

  if (total === 0) {
    throw Object.assign(
      new Error("Text chunking produced zero documents — check input quality."),
      { status: 422 },
    );
  }
  await insertDocuments([...resumeDocs, ...jdDocs]);

  return { sessionId, chunkCount: total };
}

const RETRIEVAL_QUERY =
  "candidate professional experience skills responsibilities achievements " +
  "job requirements qualifications responsibilities technologies";

const SYSTEM_TEMPLATE = `You are an expert technical interviewer conducting a deep-dive behavioural \
and technical interview. Your task is to craft a complete, high-quality opening interview question.

STRICT RULES you must follow:
1. Base the question EXCLUSIVELY on the context passages provided below.
2. The opening should begin with a brief, professional interviewer greeting and context setup (1–2 sentences) bridging the candidate's background to the target job description requirements.
3. Formulate ONE full, detailed, and specific interview question asking about a real, verifiable detail (a project, technology, role, or metric) from the résumé that matches the job description.
4. The question must invite a structured STAR-format answer (Situation, Task, Action, Result) with full clarity — do not abbreviate or trim down the question.
5. Do not add multiple questions or follow-up questions.
6. If the context is insufficient to ask a grounded question, respond only with: "INSUFFICIENT_CONTEXT"

─── CONTEXT PASSAGES ───────────────────────────────────────────────────────────
{context}
────────────────────────────────────────────────────────────────────────────────`;

const HUMAN_TEMPLATE = `Generate the complete opening interview question now. Provide the full interviewer statement and question.`;

const interviewPrompt = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(SYSTEM_TEMPLATE),
  HumanMessagePromptTemplate.fromTemplate(HUMAN_TEMPLATE),
]);

function formatContext(docs) {
  return docs
    .map((doc, i) => {
      const label =
        doc.metadata.source === "resume" ? "📄 RÉSUMÉ" : "📋 JOB DESCRIPTION";
      return `[${i + 1}] ${label}\n${doc.pageContent}`;
    })
    .join("\n\n");
}

export async function generateOpeningQuestion(sessionId) {
  let docs = await similaritySearch(RETRIEVAL_QUERY, sessionId, 4);

  // If similarity search didn't yield enough chunks, retrieve directly by session_id
  if (!docs || docs.length < 2) {
    const { data: resumeRows } = await supabase
      .from("documents")
      .select("content, metadata, source")
      .eq("session_id", sessionId)
      .eq("source", "resume")
      .order("chunk_index", { ascending: true })
      .limit(3);

    const { data: jdRows } = await supabase
      .from("documents")
      .select("content, metadata, source")
      .eq("session_id", sessionId)
      .eq("source", "job_description")
      .order("chunk_index", { ascending: true })
      .limit(3);

    const combined = [...(resumeRows || []), ...(jdRows || [])];
    if (combined.length > 0) {
      docs = combined.map(
        (r) =>
          new Document({
            pageContent: r.content,
            metadata: {
              ...r.metadata,
              source: r.source,
              session_id: sessionId,
            },
          })
      );
    }
  }

  if (!docs || !docs.length) {
    throw Object.assign(
      new Error(
        "No document chunks found for this session. Was ingestion completed?",
      ),
      { status: 404 },
    );
  }

  const context = formatContext(docs);

  const chain = interviewPrompt.pipe(getLLM()).pipe(new StringOutputParser());

  const raw = await chain.invoke({ context });
  const question = raw.trim();

  if (question === "INSUFFICIENT_CONTEXT") {
    throw Object.assign(
      new Error(
        "The retrieved context did not contain enough grounded detail to generate " +
          "a specific question. Try uploading a more detailed résumé or JD.",
      ),
      { status: 422 },
    );
  }

  const sources = docs.map((doc) => ({
    source: doc.metadata.source,
    excerpt: doc.pageContent.slice(0, 180).replace(/\s+/g, " "),
  }));

  return { question, sources, chunkCount: docs.length };
}
