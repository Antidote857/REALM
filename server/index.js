import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { GoogleGenAI } from '@google/genai'

dotenv.config()

const app = express()
const PORT = 3001

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'REALM AI backend',
  })
})

const MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
]

async function generateWithFallback(
  prompt,
  message,
  history = []
) {
  let lastError = null

  const conversation = history
    .map(
      (item) =>
        `${item.role === 'user' ? 'USER' : 'REALM AI'}: ${item.content}`
    )
    .join('\n\n')

  const fullMessage = conversation
    ? `CONVERSATION HISTORY:

${conversation}

CURRENT USER MESSAGE:

${message}`
    : message

  for (const model of MODELS) {
    try {
      console.log(`Trying Gemini model: ${model}`)

      const response = await ai.models.generateContent({
        model,
        contents: fullMessage,
        config: {
          systemInstruction: prompt,
        },
      })

      console.log(
        `Gemini response received from: ${model}`
      )

      return response.text
    } catch (error) {
      lastError = error

      console.error(
        `Gemini model ${model} failed:`,
        error.status || error.message
      )

      if (error.status !== 503) {
        throw error
      }
    }
  }

  throw lastError
}

app.post('/api/ai', async (req, res) => {
  try {
    const {
      prompt,
      message,
      history = [],
    } = req.body

    if (!prompt || !message) {
      return res.status(400).json({
        error: 'Prompt and message are required.',
      })
    }

    if (!Array.isArray(history)) {
      return res.status(400).json({
        error: 'Conversation history must be an array.',
      })
    }

    const response = await generateWithFallback(
      prompt,
      message,
      history
    )

    res.json({
      response,
    })
  } catch (error) {
    console.error('REALM AI error:', error)

    res.status(500).json({
      error:
        'REALM AI is temporarily unavailable. Please try again.',
    })
  }
})

app.listen(PORT, () => {
  console.log(
    `REALM AI backend running on http://localhost:${PORT}`
  )
})