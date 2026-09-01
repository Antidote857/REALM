import { Link } from 'react-router-dom'

function CreationCard({ creation }) {
  return (
    <article className="creation-card">
      <div className="creation-card-top">
        <span className="creation-label">CREATION</span>

        {creation.featured && (
          <span className="creation-featured">FEATURED</span>
        )}
      </div>

      <div className="creation-card-content">
        <h3>{creation.title}</h3>

        <p>{creation.excerpt}</p>

        <div className="creation-author">
          <div className="creator-avatar">
            {creation.creator.name.charAt(0)}
          </div>

          <div>
            <strong>{creation.creator.name}</strong>
            <span>@{creation.creator.username}</span>
          </div>
        </div>

        <div className="creation-stats">
          <span>{creation.likes} likes</span>
          <span>{creation.comments} comments</span>
        </div>
      </div>

      <Link
        to={`/creation/${creation.slug}`}
        className="creation-card-link"
      >
        View Creation →
      </Link>
    </article>
  )
}

export default CreationCard