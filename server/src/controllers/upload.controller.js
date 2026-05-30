import pdfParse          from 'pdf-parse/lib/pdf-parse.js'
import { ingestDocuments, generateOpeningQuestion } from '../services/ragPipeline.js'
import { createChatSession } from '../services/chatHistory.js'

function cleanPdfText(raw) {
  return raw
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export async function handleUpload(req, res, next) {
  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No résumé PDF attached. Expected field name: "resume".',
      })
    }

    const jobDescription = (req.body.jobDescription || '').trim()
    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        error: 'jobDescription field is required and must not be empty.',
      })
    }


    let parsed
    try {
      parsed = await pdfParse(req.file.buffer)
    } catch (parseErr) {
      return res.status(422).json({
        success: false,
        error: `Could not parse the PDF: ${parseErr.message}`,
      })
    }

    const resumeText = cleanPdfText(parsed.text)
    if (!resumeText) {
      return res.status(422).json({
        success: false,
        error:
          'The PDF appears to be a scanned image with no extractable text. ' +
          'Please upload a text-based PDF.',
      })
    }


    const meta = {
      fileName:   req.file.originalname,
      fileSizeKb: Math.round(req.file.size / 1024),
      pageCount:  parsed.numpages,
    }

    const { sessionId, chunkCount } = await ingestDocuments({
      resumeText,
      jobDescription,
      meta,
    })


    const { question, sources } = await generateOpeningQuestion(sessionId)




    const { chatSessionId } = await createChatSession(sessionId, question)


    return res.status(200).json({
      success: true,
      data: {
        sessionId,
        chatSessionId,
        question,
        sources,
        meta: {
          ...meta,
          chunkCount,
          parsedAt: new Date().toISOString(),
        },
      },
    })
  } catch (err) {
    next(err)
  }
}
