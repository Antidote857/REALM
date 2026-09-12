
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
    const {
      contextKey = 'global',
    } = req.body

    const conversationId = crypto.randomUUID()
    const now = new Date().toISOString()

    db.prepare(`
      INSERT INTO conversations (
        id,
        context_key,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?)
    `).run(
      conversationId,
      contextKey,
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

// Safely parse and validate Creation AI Assist responses
function parseCreationAIResponse(text) {
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error(
      'REALM AI returned an empty response.'
    )
  }

  const cleanedText = text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  let parsed

  try {
    parsed = JSON.parse(cleanedText)
  } catch (error) {
    console.error(
      'Failed to parse Creation AI JSON:',
      error
    )

    throw new Error(
      'REALM AI returned an invalid JSON response.'
    )
  }

  if (
    !parsed ||
    typeof parsed !== 'object' ||
    Array.isArray(parsed)
  ) {
    throw new Error(
      'REALM AI returned an invalid response structure.'
    )
  }

  if (
    typeof parsed.suggestedTitle !== 'string' ||
    typeof parsed.suggestedDescription !== 'string'
  ) {
    throw new Error(
      'REALM AI response is missing required fields.'
    )
  }

  return {
    suggestedTitle:
      parsed.suggestedTitle.trim(),

    suggestedDescription:
      parsed.suggestedDescription.trim(),
  }
}

// Creation AI Assist endpoint
app.post('/api/ai/assist-creation', async (req, res) => {
  try {
    const {
      title = '',
      description = '',
      world = null,
    } = req.body

    const trimmedTitle = title.trim()
    const trimmedDescription =
      description.trim()

    if (
      !trimmedTitle &&
      !trimmedDescription
    ) {
      return res.status(400).json({
        error:
          'A title or description is required for AI assistance.',
      })
    }

    const worldContext = world
      ? `
WORLD CONTEXT:
Name: ${world.name || 'Unknown'}
Category: ${world.category || 'Unknown'}
Description: ${world.description || 'Not available'}
`
      : `
WORLD CONTEXT:
No World information is available.
`

    const assistPrompt = `
You are REALM AI assisting a user who is creating
or editing a Creation on the REALM community platform.

Your task is to help refine the user's existing
Creation title and description.

${worldContext}

CURRENT CREATION:
Title: ${trimmedTitle || 'Not provided'}

Description:
${trimmedDescription || 'Not provided'}

RULES:
1. Preserve the user's original idea and meaning.
2. Do not invent facts, achievements, statistics,
   experiences, features, or claims.
3. Do not introduce information that is not present
   in the user's Creation or the supplied World context.
4. Make the title clearer and more engaging without
   changing what the Creation is about.
5. Make the description clearer, more useful, and
   easier to understand.
6. Keep the suggested description concise.
7. Return ONLY valid JSON.
8. Do not use Markdown.
9. Do not use asterisks, backticks, or commentary
   outside the JSON.

Return exactly this structure:
{
  "suggestedTitle": "string",
  "suggestedDescription": "string"
}
`

    let lastError = null

    for (const model of MODELS) {
      try {
        console.log(
          `Trying Gemini model for Creation AI Assist: ${model}`
        )

        const response =
          await ai.models.generateContent({
            model,
            contents:
              'Generate the Creation refinement suggestions now.',
            config: {
              systemInstruction:
                assistPrompt,
              responseMimeType:
                'application/json',
            },
          })

        console.log(
          `Creation AI Assist response received from: ${model}`
        )

        let suggestions

        try {
          suggestions = parseCreationAIResponse(
            response.text
          )
        } catch (parseError) {
          console.error(
            'Creation AI Assist response validation failed:',
            parseError
          )

          return res.status(502).json({
            error:
              'REALM AI returned an invalid assistance response. Please try again.',
          })
        }

        return res.json({
          suggestedTitle:
            suggestions.suggestedTitle,

          suggestedDescription:
            suggestions.suggestedDescription,
        })
      } catch (error) {
        lastError = error

        console.error(
          `Gemini model ${model} failed for Creation AI Assist:`,
          error.status || error.message
        )

        if (
          error.status !== 503 &&
          error.status !== 429
        ) {
          throw error
        }
      }
    }

    throw lastError
  } catch (error) {
    console.error(
      'Creation AI Assist error:',
      error
    )

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
        'REALM AI could not assist with this Creation. Please try again.',
    })
  }
})

// REALM AI endpoint
app.post('/api/ai', async (req, res) => {
  try {
    const {
      prompt,
      message,
      conversationId,
      contextKey = 'global',
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
        context_key,
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

    // Prevent a conversation from being used in a different AI context
    if (conversation.context_key !== contextKey) {
      return res.status(409).json({
        error:
          'This conversation belongs to a different REALM AI context.',
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

