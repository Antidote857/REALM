import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import crypto from 'crypto'
import { GoogleGenAI } from '@google/genai'
import db from './database.js'

dotenv.config()

const app = express()
const PORT = 3001

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'REALM AI backend',
  })
})

// Create a new conversation
app.post('/api/conversations', (req, res) => {
  try {
    const conversationId = crypto.randomUUID()
    const now = new Date().toISOString()

    db.prepare(`
      INSERT INTO conversations (
        id,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?)
    `).run(
      conversationId,
      now,
      now
    )

    res.status(201).json({
      conversationId,
    })
  } catch (error) {
    console.error(
      'Conversation creation error:',
      error
    )

    res.status(500).json({
      error: 'Could not create conversation.',
    })
  }
})

// Retrieve a conversation and its messages
app.get('/api/conversations/:conversationId', (req, res) => {
  try {
    const conversation = db.prepare(`
      SELECT
        id,
        created_at,
        updated_at
      FROM conversations
      WHERE id = ?
    `).get(req.params.conversationId)

    if (!conversation) {
      return res.status(404).json({
        error: 'Conversation not found.',
      })
    }

    const messages = db.prepare(`
      SELECT
        id,
        role,
        content,
        created_at
      FROM messages
      WHERE conversation_id = ?
      ORDER BY id ASC
    `).all(req.params.conversationId)

    res.json({
      id: conversation.id,
      messages,
      createdAt: conversation.created_at,
      updatedAt: conversation.updated_at,
    })
  } catch (error) {
    console.error(
      'Conversation retrieval error:',
      error
    )

    res.status(500).json({
      error: 'Could not retrieve conversation.',
    })
  }
})

// Gemini model fallback list
const MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
]

// Generate a response using stored conversation history
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

END CONVERSATION HISTORY.

CURRENT USER MESSAGE:

${message}

INSTRUCTION:
Use the conversation history to understand references,
follow-up questions, and previously established subjects.

Maintain continuity with the conversation, but treat the
current user message as the user's latest request.

Do not invent information that is not present in the
conversation history or the active REALM context.`
  : `CURRENT USER MESSAGE:

${message}`

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

      // Only fall back when Gemini is temporarily overloaded
            // Fall back when Gemini is temporarily overloaded or rate-limited
      if (
        error.status !== 503 &&
        error.status !== 429
      ) {
        throw error
      }
    }
  }

  throw lastError
}

// REALM AI endpoint
app.post('/api/ai', async (req, res) => {
  try {
    const {
      prompt,
      message,
      conversationId,
    } = req.body

    // Validate required fields
    if (!prompt || !message) {
      return res.status(400).json({
        error: 'Prompt and message are required.',
      })
    }

    // Conversation ID is required
    if (!conversationId) {
      return res.status(400).json({
        error: 'Conversation ID is required.',
      })
    }

    // Retrieve conversation from SQLite
    const conversation = db.prepare(`
      SELECT
        id,
        created_at,
        updated_at
      FROM conversations
      WHERE id = ?
    `).get(conversationId)

    if (!conversation) {
      return res.status(404).json({
        error: 'Conversation not found.',
      })
    }

    // Retrieve conversation history from SQLite
    const history = db.prepare(`
      SELECT
        role,
        content,
        created_at
      FROM messages
      WHERE conversation_id = ?
      ORDER BY id ASC
    `).all(conversationId)

    // Generate REALM AI response using stored history
    const response = await generateWithFallback(
      prompt,
      message,
      history
    )

    const now = new Date().toISOString()

    // Save user message
    db.prepare(`
      INSERT INTO messages (
        conversation_id,
        role,
        content,
        created_at
      )
      VALUES (?, ?, ?, ?)
    `).run(
      conversationId,
      'user',
      message,
      now
    )

    // Save REALM AI response
    db.prepare(`
      INSERT INTO messages (
        conversation_id,
        role,
        content,
        created_at
      )
      VALUES (?, ?, ?, ?)
    `).run(
      conversationId,
      'assistant',
      response,
      now
    )

    // Update conversation timestamp
    db.prepare(`
      UPDATE conversations
      SET updated_at = ?
      WHERE id = ?
    `).run(
      now,
      conversationId
    )

        res.json({
      response,
    })
  } catch (error) {
    console.error('REALM AI error:', error)

    if (error.status === 429) {
      return res.status(429).json({
        error:
          'REALM AI is temporarily busy due to API usage limits. Please try again shortly.',
      })
    }

    if (error.status === 503) {
      return res.status(503).json({
        error:
          'REALM AI is temporarily unavailable. Please try again shortly.',
      })
    }

    res.status(500).json({
      error:
        'REALM AI encountered an unexpected error. Please try again.',
    })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(
    `REALM AI backend running on http://localhost:3001`
  )
})