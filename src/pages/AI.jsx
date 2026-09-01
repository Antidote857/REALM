import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getAIContext } from '../utils/aiContext'
import { buildREALMPrompt } from '../utils/aiPrompt'

function AI() {
  const [searchParams] = useSearchParams()
  const aiContext = getAIContext(searchParams)
  const realmPrompt = buildREALMPrompt(searchParams)

  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])

  function handleSubmit(event) {
    event.preventDefault()

    const trimmedMessage = message.trim()

    if (!trimmedMessage) return

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: trimmedMessage,
    }

    const assistantMessage = {
      id: Date.now() + 1,
      role: 'assistant',
      content: generateDemoResponse(
        trimmedMessage,
        aiContext
      ),
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
      assistantMessage,
    ])

    setMessage('')
  }

  return (
    <main className="ai-page">
      <section className="ai-hero">
        <span className="eyebrow">
          {aiContext.label} · REALM AI
        </span>

        <h1>{aiContext.title}</h1>

        <p>{aiContext.description}</p>
      </section>

      <section className="ai-workspace">
        <div className="ai-context-indicator">
          <span>ACTIVE CONTEXT</span>

          <strong>{aiContext.label}</strong>
        </div>

        <div className="ai-conversation">
          {messages.length === 0 ? (
            <div className="ai-empty-state">
              <span className="ai-mark">✦</span>

              <h2>What do you want to explore?</h2>

              <p>
                REALM AI will use the active context to
                understand what you're asking about.
              </p>
            </div>
          ) : (
            <div className="ai-messages">
              {messages.map((item) => (
                <div
                  key={item.id}
                  className={`ai-message ai-message-${item.role}`}
                >
                  <span className="ai-message-role">
                    {item.role === 'user'
                      ? 'YOU'
                      : 'REALM AI'}
                  </span>

                  <p>{item.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <form
          className="ai-input-area"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            placeholder="Ask REALM AI..."
            aria-label="Ask REALM AI"
          />

          <button type="submit">
            Send
          </button>
        </form>
      </section>

      <section className="ai-debug">
        <div className="ai-debug-header">
          <span>DEVELOPMENT CONTEXT</span>

          <strong>REALM AI PROMPT</strong>
        </div>

        <pre>{realmPrompt}</pre>
      </section>

      <section className="ai-navigation">
        <span>EXPLORE AI</span>

        <div className="ai-navigation-links">
          <Link to="/ai">
            Global AI
          </Link>

          <Link to="/ai?context=discovery">
            Discovery
          </Link>

          <Link to="/ai?context=world&slug=technology">
            World AI
          </Link>
        </div>
      </section>
    </main>
  )
}

function generateDemoResponse(message, aiContext) {
  const lowerMessage = message.toLowerCase()

  if (
    aiContext.type === 'world' &&
    aiContext.data?.world
  ) {
    const world = aiContext.data.world

    if (
      lowerMessage.includes('member') ||
      lowerMessage.includes('people')
    ) {
      return `${world.name} currently has ${world.members.toLocaleString()} members.`
    }

    if (
      lowerMessage.includes('creation') ||
      lowerMessage.includes('content')
    ) {
      return `${world.name} currently contains ${world.creations.toLocaleString()} Creations.`
    }

    return `You're currently exploring the ${world.name} World. I have access to its public World information and public Creations.`
  }

  if (
    aiContext.type === 'creation' &&
    aiContext.data?.creation
  ) {
    const creation = aiContext.data.creation

    if (
      lowerMessage.includes('like') ||
      lowerMessage.includes('popular')
    ) {
      return `"${creation.title}" currently has ${creation.likes} likes and ${creation.comments} comments.`
    }

    return `You're currently exploring "${creation.title}", created by ${creation.creator.name}.`
  }

  if (aiContext.type === 'discovery') {
   return "You're using Discovery AI. I can help you explore the public Worlds and Creations currently available across REALM."
  }

  return 'You are currently using Global REALM AI. I can help you explore REALM, its Worlds, Creations, and communities.'
}

export default AI