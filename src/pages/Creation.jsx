
import { Link, useParams } from 'react-router-dom'
import { getCreationBySlug } from '../data/creationStore'
import { worlds } from '../data/worlds'

function Creation() {
  const { slug } = useParams()

  const creation = getCreationBySlug(slug)

  if (!creation) {
    return (
      <section className="realm-page">
        <span className="eyebrow">404</span>

        <h1>Creation not found.</h1>

        <p>
          The Creation you're looking for doesn't exist or is no longer
          available.
        </p>

        <Link to="/worlds" className="primary-button">
          Back to Worlds
        </Link>
      </section>
    )
  }

  const world = worlds.find(
    (item) => item.slug === creation.worldSlug
  )

  return (
    <article className="creation-page">
      <header className="creation-page-header">
        <div>
          <span className="eyebrow">
            {world?.name || 'WORLD'}
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
      </header>

      <div className="creation-page-layout">
        <main className="creation-body">
          <p className="creation-excerpt">
            {creation.excerpt}
          </p>

          <div className="creation-content">
            <p>{creation.content}</p>
          </div>

          <div className="creation-engagement">
            <span>{creation.likes || 0} likes</span>
            <span>{creation.comments || 0} comments</span>
          </div>
        </main>

        <aside className="creation-ai-card">
          <span className="eyebrow">CREATION AI</span>

          <h2>
            Explore this Creation with AI.
          </h2>

          <p>
            Ask REALM AI questions about this Creation while keeping its
            content and World context in view.
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
        <Link to={`/world/${creation.worldSlug}`}>
          ← Back to {world?.name || 'World'}
        </Link>
      </div>
    </article>
  )
}

export default Creation

