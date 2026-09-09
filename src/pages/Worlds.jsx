import { Link } from 'react-router-dom'
import { getWorlds } from '../data/worldStore'
import WorldCard from '../components/WorldCard'

function Worlds() {
  const worlds = getWorlds()

  const featuredWorlds = worlds.filter(
    (world) => world.featured
  )

  const otherWorlds = worlds.filter(
    (world) => !world.featured
  )

  return (
    <section className="worlds-page">
      <div className="worlds-header">
        <div>
          <span className="eyebrow">WORLDS</span>

          <h1>Find your World.</h1>

          <p>
            Communities built around interests, ideas, projects, and
            possibilities.
          </p>
        </div>

        <Link
          to="/create-world"
          className="primary-button create-world-button"
        >
          Create World
        </Link>
      </div>

      <div className="worlds-group">
        <div className="worlds-group-heading">
          <h2>Featured Worlds</h2>
          <span>{featuredWorlds.length} Worlds</span>
        </div>

        <div className="world-grid">
          {featuredWorlds.map((world) => (
            <WorldCard
              key={world.id}
              world={world}
            />
          ))}
        </div>
      </div>

      <div className="worlds-group">
        <div className="worlds-group-heading">
          <h2>Explore</h2>
          <span>{otherWorlds.length} Worlds</span>
        </div>

        <div className="world-grid">
          {otherWorlds.map((world) => (
            <WorldCard
              key={world.id}
              world={world}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Worlds