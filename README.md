# DeepDive — AI Mock Interviewer

A RAG-powered mock interview platform. Upload your résumé, paste a job description, and get grilled by an AI interviewer that actually knows your background and the role you're targeting. Includes voice support so you can practice speaking your answers out loud.

![DeepDive](public/lightning-bg.png)

---

## What it does

- Parses your PDF résumé and chunks it for retrieval
- Embeds your résumé and the job description into a vector store (Supabase pgvector)
- Runs a live conversational interview where every question is grounded in your actual experience and the JD
- Adapts follow-up questions based on what you say
- Voice input (Web Speech API) and voice output (SpeechSynthesis) so you can practice speaking
- Post-session feedback on strengths, gaps, and study topics

---

## Tech stack

**Frontend**
- React 18 + Vite
- React Router v6
- Tailwind CSS
- Lucide React icons

**Backend**
- Node.js + Express
- LangChain (`@langchain/core`)
- OpenAI or Gemini (configurable via env) for LLM + embeddings
- Supabase (Postgres + pgvector) for vector store and chat history
- Multer for file uploads
- PDF parsing + custom chunker

---

## Project structure

```
okk/
├── src/                        # Frontend (Vite React)
│   ├── components/
│   │   ├── chat/               # ChatInterface, ChatMessage, ChatInput
│   │   ├── intake/             # Resume upload, JD input, submit flow
│   │   ├── layout/             # Navbar, Footer, RootLayout
│   │   └── ui/                 # StatusBadge, Logo, FileChip, etc.
│   ├── hooks/                  # useChat, useIntakeForm, useSpeech
│   ├── pages/                  # HomePage, DashboardPage, ChatPage
│   ├── routes/                 # AppRoutes
│   └── styles/                 # globals.css (Tailwind + custom)
│
├── server/                     # Express backend
│   └── src/
│       ├── config/             # LLM, Supabase, embeddings setup
│       ├── controllers/        # chat.controller, upload.controller
│       ├── middleware/         # errorHandler, multer upload
│       ├── routes/             # chat.routes, upload.routes
│       └── services/           # ragPipeline, vectorStore, chunker, chatHistory
│
├── public/                     # Static assets
├── package.json                # Frontend deps
└── server/package.json         # Backend deps
```

---

## Getting started

### Prerequisites

- Node.js 18+
- A Supabase project with pgvector enabled
- OpenAI API key **or** Google Gemini API key

### 1. Clone

```bash
git clone https://github.com/your-username/deepdive.git
cd deepdive
```

### 2. Install dependencies

```bash
# Frontend
npm install

# Backend
cd server
npm install
```

### 3. Configure environment variables

Create `server/.env`:

```env
PORT=3001

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Choose your LLM provider: openai | gemini
LLM_PROVIDER=openai
EMBEDDING_PROVIDER=openai

# OpenAI (if using openai)
OPENAI_API_KEY=sk-...

# Gemini (if using gemini)
GOOGLE_API_KEY=AIza...
```

### 4. Set up Supabase

Run this in your Supabase SQL editor to enable pgvector and create the required tables:

```sql
create extension if not exists vector;

create table interview_sessions (
  id uuid primary key default gen_random_uuid(),
  file_name text,
  file_size_kb numeric,
  page_count int,
  created_at timestamptz default now()
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references interview_sessions(id) on delete cascade,
  content text,
  embedding vector(1536),
  metadata jsonb,
  created_at timestamptz default now()
);

create table chat_sessions (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid references interview_sessions(id) on delete cascade,
  messages jsonb default '[]',
  created_at timestamptz default now()
);

create or replace function match_documents(
  query_embedding vector(1536),
  match_count int,
  filter_session_id uuid
)
returns table(id uuid, content text, similarity float)
language plpgsql
as $$
begin
  return query
  select d.id, d.content, 1 - (d.embedding <=> query_embedding) as similarity
  from documents d
  where d.session_id = filter_session_id
  order by d.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

> If using Gemini embeddings, change `vector(1536)` to `vector(768)` in the schema.

### 5. Run

```bash
# Terminal 1 — backend
cd server
npm run dev

# Terminal 2 — frontend
npm run dev
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:3001`.

---

## How it works

1. **Upload** — résumé PDF + job description text/file go to the Express server
2. **Chunking** — the résumé is split into overlapping chunks
3. **Embedding** — each chunk is embedded (OpenAI `text-embedding-3-small` or Gemini) and stored in Supabase pgvector
4. **Interview** — each user message triggers a similarity search against the stored chunks; the top matches are injected as context into a LangChain prompt chain
5. **Response** — the LLM generates a follow-up question or feedback grounded strictly in the retrieved context
6. **Voice** — Web Speech API handles mic input; SpeechSynthesis reads the interviewer's response aloud

---

## Environment variables reference

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | ✅ | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role key (not the anon key) |
| `LLM_PROVIDER` | ✅ | `openai` or `gemini` |
| `EMBEDDING_PROVIDER` | ✅ | `openai` or `gemini` |
| `OPENAI_API_KEY` | if using openai | OpenAI secret key |
| `GOOGLE_API_KEY` | if using gemini | Google AI Studio key |
| `PORT` | ❌ | Backend port, defaults to `3001` |

---

## License

MIT
