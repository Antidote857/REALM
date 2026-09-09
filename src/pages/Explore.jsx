import { useState } from 'react'
import {
  discoverCreations,
  discoverWorlds,
  filterCreationsByCategory,
  filterWorldsByCategory,
  getWorldCategories,
  searchCreations,
  searchWorlds,
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

  const [searchQuery, setSearchQuery] =
    useState('')

  const [category, setCategory] =
    useState('all')

  const allCreations = getCreations()
  const allWorlds = getWorlds()

  const worldCategories =
    getWorldCategories(allWorlds)

  const publicCreations =
    allCreations.filter(
      (creation) =>
        creation.visibility === 'public'
    )

  const publicWorlds =
    allWorlds.filter(
      (world) =>
        world.visibility === 'public'
    )

  const categoryCreations =
    filterCreationsByCategory(
      publicCreations,
      allWorlds,
      category
    )

  const categoryWorlds =
    filterWorldsByCategory(
      publicWorlds,
      category
    )

  const searchedCreations =
    searchCreations(
      categoryCreations,
      searchQuery
    )

  const searchedWorlds =
    searchWorlds(
      categoryWorlds,
      searchQuery
    )

  const discoveredCreations =
    discoverCreations(
      searchedCreations
    )

  const discoveredWorlds =
    discoverWorlds(
      searchedWorlds,
      allCreations
    )

  const displayedCreations =
    mode === 'recommended'
      ? discoveredCreations
      : sortCreationsByMode(
          searchedCreations,
          mode
        )

  const displayedWorlds =
    mode === 'recommended'
      ? discoveredWorlds
      : sortWorldsByMode(
          searchedWorlds,
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

        <div className="explore-search">
          <input
            type="search"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(
                event.target.value
              )
            }
            placeholder="Search Worlds and Creations..."
            aria-label="Search Worlds and Creations"
          />
        </div>

        <div className="explore-categories">
          <button
            type="button"
            className={
              category === 'all'
                ? 'category-control active'
                : 'category-control'
            }
            onClick={() =>
              setCategory('all')
            }
          >
            All
          </button>

          {worldCategories.map(
            (worldCategory) => (
              <button
                key={worldCategory}
                type="button"
                className={
                  category ===
                  worldCategory
                    ? 'category-control active'
                    : 'category-control'
                }
                onClick={() =>
                  setCategory(
                    worldCategory
                  )
                }
              >
                {worldCategory}
              </button>
            )
          )}
        </div>

        <div className="discovery-controls">
          {discoveryModes.map(
            (discoveryMode) => (
              <button
                key={discoveryMode.id}
                type="button"
                className={
                  mode === discoveryMode.id
                    ? 'discovery-control active'
                    : 'discovery-control'
                }
                onClick={() =>
                  setMode(
                    discoveryMode.id
                  )
                }
              >
                {discoveryMode.label}
              </button>
            )
          )}
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

        {displayedWorlds.length > 0 ? (
          <div className="worlds-grid">
            {displayedWorlds.map(
              (world) => (
                <WorldCard
                  key={world.id}
                  world={world}
                />
              )
            )}
          </div>
        ) : (
          <div className="empty-state">
            <p>
              No Worlds match your search.
            </p>
          </div>
        )}
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

        {displayedCreations.length > 0 ? (
          <div className="creations-grid">
            {displayedCreations.map(
              (creation) => (
                <CreationCard
                  key={creation.id}
                  creation={creation}
                />
              )
            )}
          </div>
        ) : (
          <div className="empty-state">
            <p>
              No Creations match your search.
            </p>
          </div>
        )}
      </section>
    </main>
  )
}

export default Explore