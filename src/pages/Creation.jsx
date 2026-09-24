import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Pencil } from 'lucide-react'

function Creation() {
  const { slug } = useParams()

  const [creation, setCreation] = useState(null)
  const [creationLoading, setCreationLoading] = useState(true)
  const [creationError, setCreationError] = useState('')

  const [world, setWorld] = useState(null)
  const [worldLoading, setWorldLoading] = useState(true)
  const [worldError, setWorldError] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadCreation() {
      try {
        setCreationLoading(true)
        setCreationError('')

        const response = await fetch(
          `http://localhost:3001/api/creations/${encodeURIComponent(slug)}`,
          {
            credentials: 'include',
          }
        )

        const result = await response.json()

        if (!response.ok) {
          throw new Error(
            result.error || 'Failed to load Creation.'
          )
        }

        if (!mounted) return

        setCreation(result.creation || null)
      } catch (error) {
        console.error('Failed to load Creation:', error)

        if (!mounted) return

        setCreationError(
          error.message || 'Failed to load Creation.'
        )
        setCreation(null)
      } finally {
        if (mounted) {
          setCreationLoading(false)
        }
      }
    }

    if (slug) {
      loadCreation()
    } else {
      setCreationLoading(false)
    }

    return () => {
      mounted = false
    }
  }, [slug])

  useEffect(() => {
    if (!creation?.world?.slug) {
      setWorldLoading(false)
      return
    }

    let mounted = true

    async function loadWorld() {
      try {
        setWorldLoading(true)
        setWorldError('')

        const response = await fetch(
          `http://localhost:3001/api/worlds/${encodeURIComponent(
            creation.world.slug
          )}`,
          {
            credentials: 'include',
          }
        )

        const result = await response.json()

        if (!response.ok) {
          throw new Error(
            result.error || 'Failed to load World.'
          )
        }

        if (!mounted) return

        setWorld(result.world || null)
      } catch (error) {
        console.error('Failed to load Creation World:', error)

        if (!mounted) return

        setWorldError(
          error.message || 'Failed to load World.'
        )
      } finally {
        if (mounted) {
          setWorldLoading(false)
        }
      }
    }

    loadWorld()

    return () => {
      mounted = false
    }
  }, [creation?.world?.slug])

  if (creationLoading) {
    return (
      <section className="realm-page">
        <span className="eyebrow">CREATION</span>
        <h1>Loading Creation...</h1>
        <p>Loading Creation content...</p>
      </section>
    )
  }

  if (creationError || !creation) {
    return (
      <section className="realm-page">
        <span className="eyebrow">404</span>
        <h1>Creation not found.</h1>
        <p>
          {creationError ||
            "The Creation you're looking for doesn't exist or is no longer available."}
        </p>
        <Link to="/worlds" className="primary-button">
          Back to Worlds
        </Link>
      </section>
    )
  }

  if (worldLoading) {
    return (
      <section className="realm-page">
        <span className="eyebrow">CREATION</span>
        <h1>{creation.title}</h1>
        <p>Loading World context...</p>
      </section>
    )
  }

const worldName =
  world?.name ||
  creation.world?.name ||
  'World'

const worldSlug =
  world?.slug ||
  creation.world?.slug ||
  creation.worldSlug ||
  ''

  return (
    <article className="creation-page">
      <header className="creation-page-header">
        <div>
          <span className="eyebrow">
            {worldName}
          </span>

          <h1>{creation.title}</h1>

          <div className="creation-page-author">
            <div className="creator-avatar">
              {creation.creator?.name?.charAt(0) || 'Y'}
            </div>

            <div>
              <strong>
                {creation.creator?.name || 'You'}
              </strong>

              <span>
                @{creation.creator?.username || 'you'}
              </span>
            </div>
          </div>
        </div>

        <div className="creation-page-actions">
          <Link
            to={`/creation/${creation.slug}/edit`}
            className="creation-edit-button"
          >
            <Pencil size={15} strokeWidth={1.8} />
            <span>Edit Creation</span>
          </Link>
        </div>
      </header>

      {worldError && (
        <div className="creation-page-topics">
          <span className="creation-page-topic">
            World context unavailable
          </span>
        </div>
      )}

      {/* Topics */}
      {Array.isArray(creation.topics) &&
        creation.topics.length > 0 && (
          <div className="creation-page-topics">
            {creation.topics.map((topic) => (
              <span
                key={topic}
                className="creation-page-topic"
              >
                {topic}
              </span>
            ))}
          </div>
        )}

      <div className="creation-page-layout">
        <main className="creation-body">
          <p className="creation-excerpt">
            {creation.excerpt}
          </p>

          <div className="creation-content">
            <p>{creation.content}</p>
          </div>

          <div className="creation-engagement">
            <span>
              {creation.likes || 0} likes
            </span>

            <span>
              {creation.comments || 0} comments
            </span>
          </div>
        </main>

        <aside className="creation-ai-card">
          <span className="eyebrow">
            CREATION AI
          </span>

          <h2>
            Explore this Creation with AI.
          </h2>

          <p>
            Ask REALM AI questions about this Creation
            while keeping its content and World context
            in view.
          </p>

          <Link
            to={`/ai?context=creation&id=${creation.id}`}
            className="primary-button"
          >
            Open Creation AI →
          </Link>
        </aside>
      </div>

      <div className="creation-back">
        <Link
          to={`/world/${worldSlug}`}
        >
          ← Back to {worldName}
        </Link>
      </div>
    </article>
  )
}

export default Creation