import { discoverCreations, discoverWorlds } from '../utils/discovery'
import { getCreations } from '../data/creationStore'
import { getWorlds } from '../data/worldStore'
import CreationCard from '../components/CreationCard'
import WorldCard from '../components/WorldCard'

function Explore() {
  const allCreations = getCreations()
  const allWorlds = getWorlds()

  const publicCreations = allCreations.filter(
    (creation) => creation.visibility === 'public'
  )

  const discoveredCreations =
    discoverCreations(publicCreations)

  const discoveredWorlds =
    discoverWorlds(allWorlds)

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
            {discoveredWorlds.length} public Worlds
          </span>
        </div>

        <div className="worlds-grid">
          {discoveredWorlds.map((world) => (
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