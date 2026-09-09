import { Link } from 'react-router-dom'
import {
  Compass,
  User,
  Settings,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

function Home() {
  const name = 'Antidote857'

  return (
    <div className="realm-home">
      <header className="realm-home-header">
        <span className="realm-foundation-label">
          <Sparkles size={14} />
          REALM Foundation
        </span>

        <h1>Welcome, {name}</h1>

        <p>
          Your entry point into a larger digital environment.
          REALM is being built one layer at a time.
        </p>
      </header>

      <section className="realm-home-empty">
        <div className="realm-empty-icon">
          <Compass size={24} />
        </div>

        <h2>Your REALM journey begins here.</h2>

        <p>
          There's nothing here yet — and that's intentional.
          Worlds, creation, and community will arrive in future releases.
        </p>
      </section>

      <section className="realm-continue">
        <h2>Continue</h2>

        <div className="realm-nav-cards">
          <NavCard
            to="/explore"
            icon={Compass}
            title="Explore"
            desc="The REALM is expanding."
          />

          <NavCard
            to="/profile"
            icon={User}
            title="Profile"
            desc="Shape your identity."
          />

          <NavCard
            to="/settings"
            icon={Settings}
            title="Settings"
            desc="Manage your account."
          />
        </div>
      </section>

      <section className="realm-ai-card">
        <Link to="/ai" className="realm-ai-link">
          <div className="realm-ai-icon">
            <Sparkles size={20} />
          </div>

          <div className="realm-ai-content">
            <p className="realm-ai-title">
              Ask REALM AI
            </p>

            <p className="realm-ai-description">
              Brainstorm, improve, and explore — powered by
              your authorized REALM context.
            </p>
          </div>

          <ArrowRight
            className="realm-ai-arrow"
            size={17}
          />
        </Link>
      </section>
    </div>
  )
}

function NavCard({ to, icon: Icon, title, desc }) {
  return (
    <Link to={to} className="realm-nav-card">
      <div className="realm-nav-card-top">
        <div className="realm-nav-card-icon">
          <Icon size={20} />
        </div>

        <ArrowRight
          className="realm-nav-card-arrow"
          size={17}
        />
      </div>

      <h3>{title}</h3>
      <p>{desc}</p>
    </Link>
  )
}

export default Home