
import { BrowserRouter, Link, NavLink, Route, Routes } from 'react-router-dom'
import {
  Home as HomeIcon,
  Compass,
  Globe,
  Plus,
  Sparkles,
  User,
  Settings as SettingsIcon,
} from 'lucide-react'

import './App.css'

import Home from './pages/Home'
import Worlds from './pages/Worlds'
import World from './pages/World'
import Creation from './pages/Creation'
import Explore from './pages/Explore'
import AI from './pages/AI'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import CreateHub from './pages/CreateHub'
import CreateWorld from './pages/CreateWorld'
import CreateCreation from './pages/creation/CreateCreation'
import EditCreation from './pages/creation/EditCreation'

function RealmLogo() {
  return (
    <div className="local-realm-logo">
      <svg
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <polygon
          points="16,2 28.22,9 28.22,23 16,30 3.78,23 3.78,9"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          strokeLinejoin="round"
          opacity="0.45"
        />

        <polygon
          points="16,7.3 23.54,11.65 23.54,20.35 16,24.7 8.46,20.35 8.46,11.65"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          strokeLinejoin="round"
          opacity="0.8"
        />

        <polygon
          points="16,11.7 19.87,13.85 19.87,18.15 16,20.3 12.13,18.15 12.13,13.85"
          fill="hsl(var(--primary))"
        />
      </svg>

      <span>REALM</span>
    </div>
  )
}

const navigation = [
  { label: 'Home', path: '/home', icon: HomeIcon },
  { label: 'Explore', path: '/explore', icon: Compass },
  { label: 'Worlds', path: '/my-worlds', icon: Globe },
  { label: 'Create', path: '/create', icon: Plus },
  { label: 'AI', path: '/ai', icon: Sparkles },
  { label: 'Profile', path: '/profile', icon: User },
  { label: 'Settings', path: '/settings', icon: SettingsIcon },
]

function Sidebar() {
  return (
    <aside className="realm-sidebar">
      <Link
        to="/home"
        className="realm-sidebar-brand"
      >
        <RealmLogo />
      </Link>

      <div className="realm-sidebar-section">
        <span className="realm-sidebar-label">
          Navigate
        </span>

        <nav className="realm-sidebar-nav">
          {navigation.map(
            ({ label, path, icon: Icon }) => (
              <NavLink
                key={`${label}-${path}`}
                to={path}
                end={path === '/home'}
                className={({ isActive }) =>
                  isActive ? 'active' : ''
                }
              >
                <span className="sidebar-nav-icon">
                  <Icon
                    size={18}
                    strokeWidth={1.8}
                  />
                </span>

                <span>{label}</span>
              </NavLink>
            )
          )}
        </nav>
      </div>

      <div className="realm-sidebar-bottom">
        <Link
          to="/profile"
          className="realm-user"
        >
          <div className="realm-user-avatar">
            A
          </div>

          <div className="realm-user-info">
            <strong>Antidote857</strong>
            <span>REALM Creator</span>
          </div>
        </Link>
      </div>
    </aside>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="realm-app">
        <Sidebar />

        <main className="realm-main">
          <div className="realm-content">
            <Routes>
              {/* Home */}
              <Route
                path="/"
                element={<Home />}
              />

              <Route
                path="/home"
                element={<Home />}
              />

              {/* Main navigation */}
              <Route
                path="/explore"
                element={<Explore />}
              />

              <Route
                path="/my-worlds"
                element={<Worlds />}
              />

              {/* Compatibility route */}
              <Route
                path="/worlds"
                element={<Worlds />}
              />

              {/* Create */}
              <Route
                path="/create"
                element={<CreateHub />}
              />

              <Route
                path="/create-world"
                element={<CreateWorld />}
              />

              <Route
                path="/create-creation"
                element={<CreateCreation />}
              />

              {/* World */}
              <Route
                path="/world/:slug"
                element={<World />}
              />

              {/* Creation */}
              <Route
                path="/creation/:slug"
                element={<Creation />}
              />

              <Route
  path="/creation/:slug/edit"
  element={<EditCreation />}
/>

              {/* AI */}
              <Route
                path="/ai"
                element={<AI />}
              />

              {/* Profile */}
              <Route
                path="/profile"
                element={<Profile />}
              />

              {/* Settings */}
              <Route
                path="/settings"
                element={<Settings />}
              />
            </Routes>
          </div>

          <footer className="realm-footer">
            <div className="realm-footer-brand">
              <RealmLogo />
            </div>

            <p>
              Communities where AI makes the community smarter.
            </p>

            <span className="footer-status">
              BUILDING REALM • v0.8.1
            </span>
          </footer>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App

