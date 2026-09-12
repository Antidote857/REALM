import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import crypto from 'crypto'
import { promisify } from 'util'
import { GoogleGenAI } from '@google/genai'
import db from './database.js'

dotenv.config()

const app = express()
const PORT = 3001
const scrypt = promisify(crypto.scrypt)

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

app.use(cors())
app.use(express.json())

function setSessionCookie(res, sessionId, maxAge) {
  const cookie = [
    `realm_session=${encodeURIComponent(sessionId)}`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    `Max-Age=${Math.floor(maxAge / 1000)}`,
  ].join('; ')

  res.setHeader('Set-Cookie', cookie)
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'REALM AI backend',
  })
})

// Hash a password securely using scrypt
async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')

  const derivedKey = await scrypt(
    password,
    salt,
    64
  )

  return {
    passwordHash: derivedKey.toString('hex'),
    salt,
  }
}

// Verify a password against the stored salt and hash
async function verifyPassword(password, storedPasswordHash) {
  const [salt, storedHash] =
    storedPasswordHash.split(':')

  if (!salt || !storedHash) {
    return false
  }

  const derivedKey = await scrypt(
    password,
    salt,
    64
  )

  const storedHashBuffer =
    Buffer.from(storedHash, 'hex')

  if (
    derivedKey.length !==
    storedHashBuffer.length
  ) {
    return false
  }

  return crypto.timingSafeEqual(
    derivedKey,
    storedHashBuffer
  )
}

// Create a new REALM account
app.post('/api/auth/register', async (req, res) => {
  try {
    const {
      username = '',
      displayName = '',
      email = '',
      password = '',
    } = req.body

    const normalizedUsername =
      username.trim().toLowerCase()

    const normalizedDisplayName =
      displayName.trim()

    const normalizedEmail =
      email.trim().toLowerCase()

    // Validate required fields
    if (
      !normalizedUsername ||
      !normalizedDisplayName ||
      !normalizedEmail ||
      !password
    ) {
      return res.status(400).json({
        error:
          'Username, display name, email, and password are required.',
      })
    }

    // Validate username
    if (
      !/^[a-z0-9_]{3,20}$/.test(
        normalizedUsername
      )
    ) {
      return res.status(400).json({
        error:
          'Username must be 3–20 characters and contain only lowercase letters, numbers, and underscores.',
      })
    }

    // Validate display name
    if (
      normalizedDisplayName.length > 50
    ) {
      return res.status(400).json({
        error:
          'Display name must be 50 characters or fewer.',
      })
    }

    // Validate email
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        normalizedEmail
      )
    ) {
      return res.status(400).json({
        error:
          'Please provide a valid email address.',
      })
    }

    // Validate password
    if (password.length < 8) {
      return res.status(400).json({
        error:
          'Password must be at least 8 characters long.',
      })
    }

    // Check for existing username or email
    const existingUser = db.prepare(`
      SELECT
        id,
        username,
        email
      FROM users
      WHERE username = ?
         OR email = ?
      LIMIT 1
    `).get(
      normalizedUsername,
      normalizedEmail
    )

    if (existingUser) {
      if (
        existingUser.username ===
        normalizedUsername
      ) {
        return res.status(409).json({
          error:
            'Username is already taken.',
        })
      }

      if (
        existingUser.email ===
        normalizedEmail
      ) {
        return res.status(409).json({
          error:
            'An account with this email already exists.',
        })
      }
    }

    // Hash password
    const {
      passwordHash,
      salt,
    } = await hashPassword(password)

    // Store salt together with the hash.
    // The password itself is never stored.
    const storedPasswordHash =
      `${salt}:${passwordHash}`

    const userId =
      crypto.randomUUID()

    const now =
      new Date().toISOString()

    db.prepare(`
      INSERT INTO users (
        id,
        username,
        display_name,
        email,
        password_hash,
        bio,
        avatar,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      normalizedUsername,
      normalizedDisplayName,
      normalizedEmail,
      storedPasswordHash,
      '',
      '',
      now
    )

    console.log(
      `REALM account created: ${normalizedUsername}`
    )

    // Never return the password or password hash.
    return res.status(201).json({
      user: {
        id: userId,
        username: normalizedUsername,
        displayName: normalizedDisplayName,
        email: normalizedEmail,
        bio: '',
        avatar: '',
        createdAt: now,
      },
    })
  } catch (error) {
    console.error(
      'Registration error:',
      error
    )

    return res.status(500).json({
      error:
        'Could not create the REALM account.',
    })
  }
})

// Login to an existing REALM account
app.post('/api/auth/login', async (req, res) => {
  try {
    const {
      identifier,
      password,
    } = req.body

    // Validate required fields
    if (
      typeof identifier !== 'string' ||
      typeof password !== 'string' ||
      !identifier.trim() ||
      !password
    ) {
      return res.status(400).json({
        error:
          'Username/email and password are required.',
      })
    }

    const normalizedIdentifier =
      identifier.trim().toLowerCase()

    // Find the account by username OR email
    const user = db.prepare(`
      SELECT
        id,
        username,
        display_name,
        email,
        password_hash,
        bio,
        avatar,
        created_at
      FROM users
      WHERE username = ?
         OR email = ?
      LIMIT 1
    `).get(
      normalizedIdentifier,
      normalizedIdentifier
    )

    // Generic error prevents revealing whether
    // an account exists.
    if (!user) {
      return res.status(401).json({
        error:
          'Invalid username/email or password.',
      })
    }

    // Verify password
    const passwordValid =
      await verifyPassword(
        password,
        user.password_hash
      )

    if (!passwordValid) {
      return res.status(401).json({
        error:
          'Invalid username/email or password.',
      })
    }

    // Create a new session
    const sessionId =
      crypto.randomUUID()

    const createdAt =
      new Date().toISOString()

    // Session lifetime: 7 days
    const sessionMaxAge =
      7 * 24 * 60 * 60 * 1000

    const expiresAt =
      new Date(
        Date.now() + sessionMaxAge
      ).toISOString()

    db.prepare(`
      INSERT INTO sessions (
        id,
        user_id,
        expires_at,
        created_at
      )
      VALUES (?, ?, ?, ?)
    `).run(
      sessionId,
      user.id,
      expiresAt,
      createdAt
    )

    // Send the session ID as an HttpOnly cookie
    setSessionCookie(
      res,
      sessionId,
      sessionMaxAge
    )

    return res.json({
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        createdAt: user.created_at,
      },
    })
  } catch (error) {
    console.error(
      'Login failed:',
      error
    )

    return res.status(500).json({
      error: 'Unable to log in.',
    })
  }
})

// Create a new conversation
app.post('/api/conversations', (req, res) => {
  try {
    const {
      contextKey = 'global',
    } = req.body

    const conversationId =
      crypto.randomUUID()

    const now =
      new Date().toISOString()

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

    return res.status(201).json({
      conversationId,
    })
  } catch (error) {
    console.error(
      'Conversation creation error:',
      error
    )

    return res.status(500).json({
      error:
        'Could not create conversation.',
    })
  }
})

// Retrieve a conversation and its messages
app.get(
  '/api/conversations/:conversationId',
  (req, res) => {
    try {
      const conversation = db.prepare(`
        SELECT
          id,
          created_at,
          updated_at
        FROM conversations
        WHERE id = ?
      `).get(
        req.params.conversationId
      )

      if (!conversation) {
        return res.status(404).json({
          error:
            'Conversation not found.',
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
      `).all(
        req.params.conversationId
      )

      return res.json({
        id: conversation.id,
        messages,
        createdAt:
          conversation.created_at,
        updatedAt:
          conversation.updated_at,
      })
    } catch (error) {
      console.error(
        'Conversation retrieval error:',
        error
      )

      return res.status(500).json({
        error:
          'Could not retrieve conversation.',
      })
    }
  }
)

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
        `${
          item.role === 'user'
            ? 'USER'
            : 'REALM AI'
        }: ${item.content}`
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
      console.log(
        `Trying Gemini model: ${model}`
      )

      const response =
        await ai.models.generateContent({
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
  if (
    typeof text !== 'string' ||
    !text.trim()
  ) {
    throw new Error(
      'REALM AI returned an empty response.'
    )
  }

  const cleanedText = text
    .trim()
    .replace(
      /^```json\s*/i,
      ''
    )
    .replace(
      /^```\s*/i,
      ''
    )
    .replace(
      /\s*```$/,
      ''
    )
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
    typeof parsed.suggestedTitle !==
      'string' ||
    typeof parsed.suggestedDescription !==
      'string'
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
app.post(
  '/api/ai/assist-creation',
  async (req, res) => {
    try {
      const {
        title = '',
        description = '',
        world = null,
      } = req.body

      const trimmedTitle =
        title.trim()

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
Description: ${
            world.description ||
            'Not available'
          }
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

Title: ${
        trimmedTitle || 'Not provided'
      }

Description:

${
        trimmedDescription ||
        'Not provided'
      }

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
            suggestions =
              parseCreationAIResponse(
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
            error.status ||
              error.message
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

      return res.status(500).json({
        error:
          'REALM AI could not assist with this Creation. Please try again.',
      })
    }
  }
)

// REALM AI endpoint
app.post(
  '/api/ai',
  async (req, res) => {
    try {
      const {
        prompt,
        message,
        conversationId,
        contextKey = 'global',
      } = req.body

      if (!prompt || !message) {
        return res.status(400).json({
          error:
            'Prompt and message are required.',
        })
      }

      if (!conversationId) {
        return res.status(400).json({
          error:
            'Conversation ID is required.',
        })
      }

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
          error:
            'Conversation not found.',
        })
      }

      if (
        conversation.context_key !==
        contextKey
      ) {
        return res.status(409).json({
          error:
            'This conversation belongs to a different REALM AI context.',
        })
      }

      const history = db.prepare(`
        SELECT
          role,
          content,
          created_at
        FROM messages
        WHERE conversation_id = ?
        ORDER BY id ASC
      `).all(conversationId)

      const response =
        await generateWithFallback(
          prompt,
          message,
          history
        )

      const now =
        new Date().toISOString()

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

      db.prepare(`
        UPDATE conversations
        SET updated_at = ?
        WHERE id = ?
      `).run(
        now,
        conversationId
      )

      return res.json({
        response,
      })
    } catch (error) {
      console.error(
        'REALM AI error:',
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

      return res.status(500).json({
        error:
          'REALM AI encountered an unexpected error. Please try again.',
      })
    }
  }
)

// Start server
app.listen(PORT, () => {
  console.log(
    `REALM AI backend running on http://localhost:${PORT}`
  )
})