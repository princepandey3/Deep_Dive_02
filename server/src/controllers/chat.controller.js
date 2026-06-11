import {
  createChatSession,
  getChatSessionByInterviewId,
  getMessages,
  appendMessages,
} from "../services/chatHistory.js";
import { similaritySearch } from "../services/vectorStore.js";
import { createLLM } from "../config/llm.js";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  MessagesPlaceholder,
  HumanMessagePromptTemplate,
} from "@langchain/core/prompts";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";

let _llm = null;
function getLLM() {
  if (!_llm) _llm = createLLM();
  return _llm;
}

const FOLLOW_UP_SYSTEM = `You are an expert technical interviewer conducting a structured, \
grounded behavioural and technical interview. You are mid-conversation with a candidate.

STRICT RULES:
1. Your questions and comments must be grounded EXCLUSIVELY in the context passages below \
   (extracted from the candidate's résumé and the job description) AND in what the candidate \
   has already said in the conversation history.
2. Ask ONE follow-up question at a time. Do not stack multiple questions.
3. Probe for specifics: metrics, timelines, technologies, team size, personal contribution.
4. Encourage STAR-format responses (Situation, Task, Action, Result) when appropriate.
5. Never invent skills, projects, or details not found in the context or the candidate's replies.
6. Keep each response concise (2–4 sentences max before the question).

─── CONTEXT PASSAGES ────────────────────────────────────────────────────────────
{context}
─────────────────────────────────────────────────────────────────────────────────`;

function formatContext(docs) {
  if (!docs.length)
    return "(No relevant context found — proceed based on conversation history.)";
  return docs
    .map((doc, i) => {
      const label =
        doc.metadata.source === "resume" ? "📄 RÉSUMÉ" : "📋 JOB DESCRIPTION";
      return `[${i + 1}] ${label}\n${doc.pageContent}`;
    })
    .join("\n\n");
}

function buildMessageHistory(rows) {
  return rows.map((row) =>
    row.role === "user"
      ? new HumanMessage(row.content)
      : new AIMessage(row.content),
  );
}

export async function handleChat(req, res, next) {
  try {
    const { sessionId, message } = req.body ?? {};

    if (!sessionId || typeof sessionId !== "string") {
      return res.status(400).json({
        success: false,
        error: "`sessionId` is required (the interview session UUID).",
      });
    }

    const userText = (message ?? "").trim();
    if (!userText) {
      return res.status(400).json({
        success: false,
        error: "`message` must be a non-empty string.",
      });
    }

    let chatSession = await getChatSessionByInterviewId(sessionId);

    if (!chatSession) {
      const { chatSessionId } = await createChatSession(sessionId, "");
      chatSession = { id: chatSessionId, opening_question: "" };
    }

    const chatSessionId = chatSession.id;

    const historyRows = await getMessages(chatSessionId);
    const messageHistory = buildMessageHistory(historyRows);

    const ragDocs = await similaritySearch(userText, sessionId);
    const context = formatContext(ragDocs);
    const ragSources = ragDocs.map((doc) => ({
      source: doc.metadata.source,
      excerpt: doc.pageContent.slice(0, 180).replace(/\s+/g, " "),
    }));

    const prompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(FOLLOW_UP_SYSTEM),
      new MessagesPlaceholder("history"),
      HumanMessagePromptTemplate.fromTemplate("{input}"),
    ]);

    const chain = prompt.pipe(getLLM()).pipe(new StringOutputParser());

    const aiReply = await chain.invoke({
      context,
      history: messageHistory,
      input: userText,
    });

    const replyText = aiReply.trim();

    await appendMessages(chatSessionId, [
      { role: "user", content: userText, ragSources: null },
      { role: "assistant", content: replyText, ragSources: ragSources },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        reply: replyText,
        ragSources,
        sessionId,
        chatSessionId,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getSessionOpeningQuestion(req, res, next) {
  try {
    const { sessionId } = req.params;
    const chatSession = await getChatSessionByInterviewId(sessionId);
    if (!chatSession) {
      return res
        .status(404)
        .json({ success: false, error: "Session not found" });
    }
    return res.json({
      success: true,
      data: { question: chatSession.opening_question },
    });
  } catch (err) {
    next(err);
  }
}
