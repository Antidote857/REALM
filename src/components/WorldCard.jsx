import { Link } from 'react-router-dom'

function WorldCard({ world }) {
  return (
    <article className="world-card">
      <div className="world-card-top">
        <span className="world-category">{world.category}</span>
        {world.featured && <span className="world-featured">FEATURED</span>}
      </div>

      <div className="world-card-content">
        <h3>{world.name}</h3>

        <p>{world.description}</p>

        <div className="world-stats">
          <span>
            <strong>{world.members.toLocaleString()}</strong>
            members
          </span>

          <span>
            <strong>{world.creations.toLocaleString()}</strong>
            creations
          </span>
        </div>
      </div>

      <Link to={`/world/${world.slug}`} className="world-card-link">
        Enter World →
      </Link>
    </article>
  )
}

export default WorldCard