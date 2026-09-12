import { Link } from 'react-router-dom'
import { ArrowRight, Compass, Globe, Sparkles } from 'lucide-react'
import { getWorlds } from '../data/worldStore'
import { getCreations } from '../data/creationStore'
import { getProfile } from '../data/profileStore'

function Profile() {
  const worlds = getWorlds()
  const creations = getCreations()
  const profile = getProfile()

  const name =
    profile.displayName ||
    profile.username ||
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
    {profile.bio || 'Your REALM identity.'}
  </p>
</div>
        </div>

        <p className="profile-intro">
          Your profile, Worlds, Creations, and community activity will live here.
        </p>
      </header>

      <section className="profile-stats">
        <div className="profile-stat">
          <strong>{worlds.length}</strong>
          <span>Worlds</span>
        </div>

        <div className="profile-stat">
          <strong>{creations.length}</strong>
          <span>Creations</span>
        </div>

        <div className="profile-stat">
          <strong>—</strong>
          <span>Community activity</span>
        </div>
      </section>

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