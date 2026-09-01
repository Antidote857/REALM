import { Link, useParams } from 'react-router-dom'
import { worlds } from '../data/worlds'
import { creations } from '../data/creations'
import CreationCard from '../components/CreationCard'

function World() {
  const { slug } = useParams()

  const world = worlds.find((item) => item.slug === slug)

  const worldCreations = creations.filter(
  (creation) => creation.worldSlug === slug
)

  if (!world) {
    return (
      <section className="realm-page">
        <span className="eyebrow">404</span>

        <h1>World not found.</h1>

        <p>
          The World you're looking for doesn't exist or is no longer
          available.
        </p>

        <Link to="/worlds" className="primary-button">
          Back to Worlds
        </Link>
      </section>
    )
  }

  return (
    <section className="world-page">
      <div className="world-page-header">
        <div>
          <span className="eyebrow">{world.category}</span>

          <h1>{world.name}</h1>

          <p>{world.description}</p>
        </div>

        <button className="primary-button">
          Join World
        </button>
      </div>

      <div className="world-meta">
        <div>
          <strong>{world.members.toLocaleString()}</strong>
          <span>Members</span>
        </div>

        <div>
          <strong>{world.creations.toLocaleString()}</strong>
          <span>Creations</span>
        </div>

        <div>
          <strong>Public</strong>
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

      <div id="overview" className="world-content">
        <div>
          <span className="eyebrow">OVERVIEW</span>

          <h2>Welcome to {world.name}.</h2>

          <p>
            This is the beginning of this World. Members will eventually be
            able to share Creations, discuss ideas, collaborate on projects,
            and build the identity of this community together.
          </p>
        </div>

        <aside id="world-ai" className="world-ai-card">
          <span className="eyebrow">WORLD AI</span>

          <h3>
            Ask AI about {world.name}.
          </h3>

          <p>
            REALM AI will eventually understand this World's context,
            conversations, Creations, and knowledge.
          </p>

          <Link
            to={`/ai?context=world&slug=${world.slug}`}
            className="secondary-button"
          >
            Open World AI →
          </Link>
        </aside>
      </div>

      <div id="creations" className="world-creations-section">
  <div className="world-section-heading">
    <div>
      <span className="eyebrow">CREATIONS</span>
      <h2>What this World is creating.</h2>
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
      <p>This World hasn't created anything yet.</p>
    </div>
  )}
</div>

      <div id="members" className="world-placeholder-section">
        <span className="eyebrow">MEMBERS</span>
        <h2>The people building this World.</h2>
        <p>
          World members and community activity will appear here.
        </p>
      </div>

      <div id="about" className="world-placeholder-section">
        <span className="eyebrow">ABOUT</span>
        <h2>About this World.</h2>
        <p>
          World rules, purpose, ownership, and other information will live
          here.
        </p>
      </div>
    </section>
  )
}

export default World