import { useState } from 'react'
import {
  discoverCreations,
  discoverWorlds,
  sortCreationsByMode,
  sortWorldsByMode,
} from '../utils/discovery'
import { getCreations } from '../data/creationStore'
import { getWorlds } from '../data/worldStore'
import CreationCard from '../components/CreationCard'
import WorldCard from '../components/WorldCard'

const discoveryModes = [
  {
    id: 'recommended',
    label: 'Recommended',
  },
  {
    id: 'trending',
    label: 'Trending',
  },
  {
    id: 'newest',
    label: 'Newest',
  },
  {
    id: 'most-active',
    label: 'Most Active',
  },
]

function Explore() {
  const [mode, setMode] =
    useState('recommended')

  const allCreations = getCreations()
  const allWorlds = getWorlds()

  const publicCreations =
    allCreations.filter(
      (creation) =>
        creation.visibility === 'public'
    )

  const discoveredCreations =
    discoverCreations(publicCreations)

  const discoveredWorlds =
    discoverWorlds(
      allWorlds,
      allCreations
    )

  const displayedCreations =
    mode === 'recommended'
      ? discoveredCreations
      : sortCreationsByMode(
          allCreations,
          mode
        )

  const displayedWorlds =
    mode === 'recommended'
      ? discoveredWorlds
      : sortWorldsByMode(
          allWorlds,
          allCreations,
          mode
        )

  return (
    <main className="explore-page">
      <section className="explore-hero">
        <span className="section-label">
          DISCOVER
        </span>

        <h1>
          Find something worth exploring.
        </h1>

        <p>
          Explore public Worlds and Creations
          from across REALM. Discovery is shaped
          by relevance, engagement, and recency.
        </p>

        <div className="discovery-controls">
          {discoveryModes.map((discoveryMode) => (
            <button
              key={discoveryMode.id}
              type="button"
              className={
                mode === discoveryMode.id
                  ? 'discovery-control active'
                  : 'discovery-control'
              }
              onClick={() =>
                setMode(discoveryMode.id)
              }
            >
              {discoveryMode.label}
            </button>
          ))}
        </div>
      </section>

      <section className="explore-section">
        <div className="explore-section-header">
          <div>
            <span className="section-label">
              WORLDS
            </span>

            <h2>Explore Worlds</h2>
          </div>

          <span className="explore-count">
            {displayedWorlds.length} public Worlds
          </span>
        </div>

        <div className="worlds-grid">
          {displayedWorlds.map((world) => (
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
            <span className="section-label">
              CREATIONS
            </span>

            <h2>Discover Creations</h2>
          </div>

          <span className="explore-count">
            {displayedCreations.length} public
            Creations
          </span>
        </div>

        <div className="creations-grid">
          {displayedCreations.map((creation) => (
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