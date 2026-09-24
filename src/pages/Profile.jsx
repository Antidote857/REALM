import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Compass, Globe, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function Profile() {
  const [worlds, setWorlds] = useState([])
  const [worldsLoading, setWorldsLoading] = useState(true)
  const [worldsError, setWorldsError] = useState('')

  const [creations, setCreations] = useState([])
  const [creationsLoading, setCreationsLoading] = useState(true)
  const [creationsError, setCreationsError] = useState('')

  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading || !user) return

    let mounted = true

    async function loadProfileData() {
      try {
        setWorldsLoading(true)
        setCreationsLoading(true)
        setWorldsError('')
        setCreationsError('')

        const [worldsResponse, creationsResponse] = await Promise.all([
          fetch('http://localhost:3001/api/worlds', {
            credentials: 'include',
          }),

          fetch('http://localhost:3001/api/creations', {
            credentials: 'include',
          }),
        ])

        const worldsResult = await worldsResponse.json()
        const creationsResult = await creationsResponse.json()

        if (!worldsResponse.ok) {
          throw new Error(
            worldsResult.error || 'Failed to load Worlds.'
          )
        }

        if (!creationsResponse.ok) {
          throw new Error(
            creationsResult.error || 'Failed to load Creations.'
          )
        }

        if (!mounted) return

        const allWorlds = worldsResult.worlds || []
        const allCreations = creationsResult.creations || []

        const userWorlds = allWorlds.filter(
          (world) => world.owner_id === user.id
        )

        const userCreations = allCreations.filter(
          (creation) => creation.creator_id === user.id
        )

        setWorlds(userWorlds)
        setCreations(userCreations)
      } catch (error) {
        console.error('Failed to load profile data:', error)

        if (!mounted) return

        if (error.message?.includes('Worlds')) {
          setWorldsError(error.message)
        } else {
          setCreationsError(error.message || 'Failed to load Creations.')
        }
      } finally {
        if (mounted) {
          setWorldsLoading(false)
          setCreationsLoading(false)
        }
      }
    }

    loadProfileData()

    return () => {
      mounted = false
    }
  }, [loading, user])

  if (loading || worldsLoading || creationsLoading) {
    return (
      <section className="profile-page">
        <p>Loading profile...</p>
      </section>
    )
  }

  const name =
    user?.displayName ||
    user?.username ||
    'Unnamed'

  return (
    <section className="profile-page">
      <header className="profile-header">
        <span className="eyebrow">PROFILE</span>

        <div className="profile-identity">
          <div className="profile-avatar">
            {name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h1>{name}</h1>

            <p>
              {user?.bio || 'Your REALM identity.'}
            </p>
          </div>
        </div>

        <p className="profile-intro">
          Your profile, Worlds, Creations, and community activity will live here.
        </p>
      </header>

      <section className="profile-stats">
        <div className="profile-stat">
          <strong>
            {worldsError ? '—' : worlds.length}
          </strong>
          <span>Worlds</span>
        </div>

        <div className="profile-stat">
          <strong>
            {creationsError ? '—' : creations.length}
          </strong>
          <span>Creations</span>
        </div>

        <div className="profile-stat">
          <strong>—</strong>
          <span>Community activity</span>
        </div>
      </section>

      {worldsError && (
        <section className="profile-placeholder">
          <span>WORLD DATA</span>

          <strong>
            {worldsError}
          </strong>
        </section>
      )}

      {creationsError && (
        <section className="profile-placeholder">
          <span>CREATION DATA</span>

          <strong>
            {creationsError}
          </strong>
        </section>
      )}

      <section className="profile-section">
        <div className="profile-section-header">
          <div>
            <span className="section-label">YOUR REALM</span>
            <h2>Explore your space.</h2>
          </div>
        </div>

        <div className="profile-action-grid">
          <Link
            to="/my-worlds"
            className="profile-action-card"
          >
            <div className="profile-action-icon">
              <Globe size={20} />
            </div>

            <div>
              <h3>Worlds</h3>
              <p>
                Explore the Worlds currently available in REALM.
              </p>
            </div>

            <ArrowRight
              className="profile-action-arrow"
              size={17}
            />
          </Link>

          <Link
            to="/explore"
            className="profile-action-card"
          >
            <div className="profile-action-icon">
              <Compass size={20} />
            </div>

            <div>
              <h3>Explore</h3>
              <p>
                Discover public Worlds and Creations across REALM.
              </p>
            </div>

            <ArrowRight
              className="profile-action-arrow"
              size={17}
            />
          </Link>

          <Link
            to="/ai"
            className="profile-action-card"
          >
            <div className="profile-action-icon">
              <Sparkles size={20} />
            </div>

            <div>
              <h3>REALM AI</h3>
              <p>
                Explore REALM using your authorized AI context.
              </p>
            </div>

            <ArrowRight
              className="profile-action-arrow"
              size={17}
            />
          </Link>
        </div>
      </section>

      <section className="profile-placeholder">
        <span>PROFILE SYSTEM</span>

        <strong>
          Authentication, ownership, and community activity are coming in a later release.
        </strong>
      </section>
    </section>
  )
}

export default Profile
