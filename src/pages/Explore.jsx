import { creations } from '../data/creations'
import { worlds } from '../data/worlds'
import { discoverCreations } from '../utils/discovery'
import CreationCard from '../components/CreationCard'
import WorldCard from '../components/WorldCard'

function Explore() {
  const discoveredCreations = discoverCreations(creations)

  const publicWorlds = worlds.filter(
    (world) => world.visibility === 'public'
  )

  return (
    <main className="explore-page">
      <section className="explore-hero">
        <span className="section-label">DISCOVER</span>

        <h1>Find something worth exploring.</h1>

        <p>
          Explore public Worlds and Creations from across REALM.
          Discovery is shaped by relevance, engagement, and recency.
        </p>
      </section>

      <section className="explore-section">
        <div className="explore-section-header">
          <div>
            <span className="section-label">WORLDS</span>
            <h2>Explore Worlds</h2>
          </div>

          <span className="explore-count">
            {publicWorlds.length} public Worlds
          </span>
        </div>

        <div className="worlds-grid">
          {publicWorlds.map((world) => (
            <WorldCard
              key={world.id}
              world={world}
            />
          ))}
        </div>
      </section>

      <section className="explore-section">
        <div className="explore-section-header">
          <div>
            <span className="section-label">CREATIONS</span>
            <h2>Discover Creations</h2>
          </div>

          <span className="explore-count">
            {discoveredCreations.length} public Creations
          </span>
        </div>

        <div className="creations-grid">
          {discoveredCreations.map((creation) => (
            <CreationCard
              key={creation.id}
              creation={creation}
            />
          ))}
        </div>
      </section>
    </main>
  )
}

export default Explore