import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import WorldCard from '../components/WorldCard'

function Worlds() {
  const [worlds, setWorlds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadWorlds() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          'http://localhost:3001/api/worlds',
          {
            credentials: 'include',
          }
        )

        const result = await response.json()

        if (!response.ok) {
          throw new Error(
            result.error || 'Failed to load Worlds'
          )
        }

        if (mounted) {
          setWorlds(result.worlds || [])
        }
      } catch (error) {
        console.error(
          'Failed to load Worlds:',
          error
        )

        if (mounted) {
          setWorlds([])
          setError(
            error.message ||
              'Failed to load Worlds'
          )
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadWorlds()

    return () => {
      mounted = false
    }
  }, [])

  const featuredWorlds = worlds.filter(
    (world) => Boolean(world.featured)
  )

  const otherWorlds = worlds.filter(
    (world) => !world.featured
  )

  if (loading) {
    return (
      <section className="worlds-page">
        <div className="worlds-header">
          <div>
            <span className="eyebrow">WORLDS</span>

            <h1>Find your World.</h1>

            <p>
              Communities built around interests, ideas, projects,
              and possibilities.
            </p>
          </div>

          <Link
            to="/create-world"
            className="primary-button create-world-button"
          >
            Create World
          </Link>
        </div>

        <div className="empty-state">
          <p>Loading Worlds...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="worlds-page">
        <div className="worlds-header">
          <div>
            <span className="eyebrow">WORLDS</span>

            <h1>Find your World.</h1>

            <p>
              Communities built around interests, ideas, projects,
              and possibilities.
            </p>
          </div>

          <Link
            to="/create-world"
            className="primary-button create-world-button"
          >
            Create World
          </Link>
        </div>

        <div className="empty-state">
          <p>{error}</p>
        </div>
      </section>
    )
  }

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