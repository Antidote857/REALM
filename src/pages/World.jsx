import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { getCreationsByWorld } from '../data/creationStore'
import CreationCard from '../components/CreationCard'

function World() {
  const { slug } = useParams()

  const [world, setWorld] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const worldCreations = world
    ? getCreationsByWorld(slug)
    : []

  useEffect(() => {
    let mounted = true

    async function loadWorld() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `http://localhost:3001/api/worlds/${encodeURIComponent(slug)}`,
          {
            credentials: 'include',
          }
        )

        const result = await response.json()

        if (!response.ok) {
          throw new Error(
            result.error || 'Failed to load World'
          )
        }

        if (mounted) {
          setWorld(result.world)
        }
      } catch (error) {
        console.error(
          'Failed to load World:',
          error
        )

        if (mounted) {
          setWorld(null)
          setError(
            error.message ||
              'Failed to load World'
          )
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    if (slug) {
      loadWorld()
    }

    return () => {
      mounted = false
    }
  }, [slug])

  if (loading) {
    return (
      <section className="realm-page">
        <span className="eyebrow">WORLD</span>

        <h1>Loading World...</h1>

        <p>
          Preparing this World.
        </p>
      </section>
    )
  }

  if (!world) {
    return (
      <section className="realm-page">
        <span className="eyebrow">404</span>

        <h1>World not found.</h1>

        <p>
          {error ||
            "The World you're looking for doesn't exist or is no longer available."}
        </p>

        <Link
          to="/worlds"
          className="primary-button"
        >
          Back to Worlds
        </Link>
      </section>
    )
  }

  return (
    <section className="world-page">
      <div className="world-page-header">
        <div>
          <span className="eyebrow">
            {world.category || 'COMMUNITY'}
          </span>

          <h1>{world.name}</h1>

          <p>{world.description}</p>
        </div>

        <div className="world-page-actions">
          <Link
            to={`/create-creation?world=${world.id}`}
            className="world-create-button"
          >
            <Plus size={15} strokeWidth={1.8} />
            <span>Create Creation</span>
          </Link>

          <button className="secondary-button">
            Join World
          </button>
        </div>
      </div>

      <div className="world-meta">
        <div>
          <strong>
            {(world.members || 0).toLocaleString()}
          </strong>
          <span>Members</span>
        </div>

        <div>
          <strong>
            {worldCreations.length.toLocaleString()}
          </strong>
          <span>Creations</span>
        </div>

        <div>
          <strong>
            {world.visibility === 'private'
              ? 'Private'
              : 'Public'}
          </strong>
          <span>Visibility</span>
        </div>
      </div>

      <nav className="world-tabs">
        <a href="#overview">Overview</a>
        <a href="#creations">Creations</a>
        <a href="#members">Members</a>
        <a href="#about">About</a>
        <a href="#world-ai">World AI</a>
      </nav>

      <div
        id="overview"
        className="world-content"
      >
        <div>
          <span className="eyebrow">OVERVIEW</span>

          <h2>
            Welcome to {world.name}.
          </h2>

          <p>
            This is the beginning of this World. Members will
            eventually be able to share Creations, discuss ideas,
            collaborate on projects, and build the identity of
            this community together.
          </p>
        </div>

        <aside
          id="world-ai"
          className="world-ai-card"
        >
          <span className="eyebrow">WORLD AI</span>

          <h3>
            Ask AI about {world.name}.
          </h3>

          <p>
            REALM AI understands this World's context and can
            help you explore its public Creations and knowledge.
          </p>

          <Link
            to={`/ai?context=world&slug=${world.slug}`}
            className="secondary-button"
          >
            Open World AI →
          </Link>
        </aside>
      </div>

      <div
        id="creations"
        className="world-creations-section"
      >
        <div className="world-section-heading">
          <div>
            <span className="eyebrow">CREATIONS</span>

            <h2>
              What this World is creating.
            </h2>
          </div>

          <span className="creation-count">
            {worldCreations.length} Creations
          </span>
        </div>

        {worldCreations.length > 0 ? (
          <div className="creation-grid">
            {worldCreations.map((creation) => (
              <CreationCard
                key={creation.id}
                creation={creation}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>
              This World hasn't created anything yet.
            </p>
          </div>
        )}
      </div>

      <div
        id="members"
        className="world-placeholder-section"
      >
        <span className="eyebrow">MEMBERS</span>

        <h2>
          The people building this World.
        </h2>

        <p>
          World members and community activity will appear
          here.
        </p>
      </div>

      <div
        id="about"
        className="world-placeholder-section"
      >
        <span className="eyebrow">ABOUT</span>

        <h2>
          About this World.
        </h2>

        <p>
          World rules, purpose, ownership, and other
          information will live here.
        </p>
      </div>
    </section>
  )
}

export default World