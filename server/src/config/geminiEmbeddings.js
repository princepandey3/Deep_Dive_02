import { GoogleGenerativeAI } from '@google/generative-ai'
import { Embeddings }          from '@langchain/core/embeddings'

export class GeminiEmbeddingsWithDims extends Embeddings {
  constructor({ apiKey, model = 'gemini-embedding-001', outputDimensionality = 768 }) {
    super({})
    this.model               = model
    this.outputDimensionality = outputDimensionality
    this.client              = new GoogleGenerativeAI(apiKey)
      .getGenerativeModel({ model })
  }


  async embedQuery(text) {
    const res = await this.client.embedContent({
      content:  { role: 'user', parts: [{ text }] },
      outputDimensionality: this.outputDimensionality,
    })
    return res.embedding.values
  }


  async embedDocuments(texts) {
    const BATCH = 100
    const results = []

    for (let i = 0; i < texts.length; i += BATCH) {
      const batch = texts.slice(i, i + BATCH)
      const promises = batch.map((text) =>
        this.client.embedContent({
          content:  { role: 'user', parts: [{ text }] },
          outputDimensionality: this.outputDimensionality,
        })
      )
      const responses = await Promise.all(promises)
      results.push(...responses.map((r) => r.embedding.values))
    }

    return results
  }
}
