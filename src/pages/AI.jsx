import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getAIContext } from '../utils/aiContext'
import { buildREALMPrompt } from '../utils/aiPrompt'

function AI() {
  const [searchParams] = useSearchParams()
  const aiContext = getAIContext(searchParams)
  const realmPrompt = buildREALMPrompt(searchParams)

  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState(null)

  const contextKey = searchParams.toString()

 useEffect(() => {
  let isActive = true

  async function loadConversation() {
    setMessages([])
    setMessage('')
    setConversationId(null)
    setIsLoading(false)

    const storageKey =
      `realm-ai-conversation:${contextKey || 'global'}`

    const savedConversationId =
      localStorage.getItem(storageKey)

    try {
      if (savedConversationId) {
        const response = await fetch(
          `http://localhost:3001/api/conversations/${savedConversationId}`
        )

        if (response.ok) {
          const conversation = await response.json()

          if (isActive) {
            setConversationId(conversation.id)

            setMessages(
              conversation.messages.map((item) => ({
                id: `${item.id}-${item.created_at}`,
                role: item.role,
                content: item.content,
              }))
            )
          }

          return
        }

        localStorage.removeItem(storageKey)
      }

      const response = await fetch(
        'http://localhost:3001/api/conversations',
        {
          method: 'POST',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || 'Could not create conversation.'
        )
      }

      if (isActive) {
        setConversationId(data.conversationId)

        localStorage.setItem(
          storageKey,
          data.conversationId
        )
      }
    } catch (error) {
      if (isActive) {
        console.error(
          'REALM conversation error:',
          error
        )
      }
    }
  }

  loadConversation()

  return () => {
    isActive = false
  }
}, [contextKey])

  async function handleSubmit(event) {
    event.preventDefault()

    const trimmedMessage = message.trim()

    if (
      !trimmedMessage ||
      isLoading ||
      !conversationId
    ) {
      return
    }

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: trimmedMessage,
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
    ])

    setMessage('')
    setIsLoading(true)

    try {
      const response = await fetch(
        'http://localhost:3001/api/ai',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: realmPrompt,
            message: trimmedMessage,
            conversationId,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || 'REALM AI request failed.'
        )
      }

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.response,
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        assistantMessage,
      ])
    } catch (error) {
      console.error('REALM AI error:', error)

      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content:
          'REALM AI could not respond right now. Please try again.',
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        errorMessage,
      ])
    } finally {
      setIsLoading(false)
    }
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

              {isLoading && (
                <div className="ai-message ai-message-assistant">
                  <span className="ai-message-role">
                    REALM AI
                  </span>

                  <p>Thinking...</p>
                </div>
              )}
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
            disabled={isLoading || !conversationId}
          />

          <button
            type="submit"
            disabled={isLoading || !conversationId}
          >
            {isLoading ? 'Thinking...' : 'Send'}
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

export default AI