import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { Document }                        from '@langchain/core/documents'

const CHUNK_SIZE    = parseInt(process.env.CHUNK_SIZE    || '800',  10)
const CHUNK_OVERLAP = parseInt(process.env.CHUNK_OVERLAP || '120',  10)

function makeSplitter(source) {
  const overlapMultiplier = source === 'resume' ? 1 : 0.8
  return new RecursiveCharacterTextSplitter({
    chunkSize:    CHUNK_SIZE,
    chunkOverlap: Math.round(CHUNK_OVERLAP * overlapMultiplier),

    separators: ['\n\n', '\n', '. ', ' ', ''],
  })
}

export async function chunkText(text, source, sessionId) {
  if (!text?.trim()) return []

  const splitter = makeSplitter(source)
  const rawChunks = await splitter.splitText(text)

  return rawChunks
    .filter((chunk) => chunk.trim().length > 20)
    .map((chunk, index) =>
      new Document({
        pageContent: chunk.trim(),
        metadata: {
          source,
          session_id:  sessionId,
          chunk_index: index,
        },
      })
    )
}

export async function chunkAll({ resumeText, jobDescription, sessionId }) {
  const [resumeDocs, jdDocs] = await Promise.all([
    chunkText(resumeText,    'resume',           sessionId),
    chunkText(jobDescription, 'job_description', sessionId),
  ])

  return {
    resumeDocs,
    jdDocs,
    total: resumeDocs.length + jdDocs.length,
  }
}
