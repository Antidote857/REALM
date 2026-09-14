
import {
  BrowserRouter,
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom'


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
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'

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
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()

  const displayName =
    user?.displayName ||
    user?.username ||
    'Guest'

  const username =
    user?.username ||
    'guest'

  const avatarLetter =
    displayName.charAt(0).toUpperCase()

  async function handleLogout() {
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (error) {
      console.error(
        'Failed to log out:',
        error
      )
    }
  }

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
                key={label + path}
                to={path}
                end={path === '/home'}
                className={({ isActive }) =>
                  isActive ? 'active' : ''
                }
              >
                <span className="sidebar-nav-icon">
                  <Icon size={18} />
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
            {loading ? '…' : avatarLetter}
          </div>

          <div className="realm-user-info">
            <strong>
              {loading
                ? 'Loading...'
                : displayName}
            </strong>

            <span>
              {loading
                ? 'Checking session...'
                : '@' + username}
            </span>
          </div>
        </Link>

        <button
          type="button"
          className="realm-logout-button"
          onClick={handleLogout}
          disabled={loading}
        >
          Log out
        </button>
      </div>
    </aside>
  )
}



function RootRoute() {
  const { loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <span className="eyebrow">REALM</span>

          <h1>Entering your REALM...</h1>

          <p className="auth-intro">
            Checking your authentication session.
          </p>
        </div>
      </div>
    )
  }

  return isAuthenticated
    ? <Navigate to="/home" replace />
    : <Navigate to="/login" replace />
}

function ProtectedRoute({ children }) {
  const { loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <span className="eyebrow">REALM</span>

          <h1>Entering your REALM...</h1>

          <p className="auth-intro">
            Checking your authentication session.
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="realm-app">
          <Sidebar />

          <main className="realm-main">
            <div className="realm-content">
              <Routes>
  <Route
    path="/"
    element={<RootRoute />}
  />

  <Route
    path="/login"
    element={<Login />}
  />

  <Route
    path="/register"
    element={<Register />}
  />

  <Route
    path="/home"
    element={
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    }
  />

  <Route
    path="/explore"
    element={
      <ProtectedRoute>
        <Explore />
      </ProtectedRoute>
    }
  />

  <Route
    path="/my-worlds"
    element={
      <ProtectedRoute>
        <Worlds />
      </ProtectedRoute>
    }
  />

  <Route
    path="/worlds"
    element={
      <ProtectedRoute>
        <Worlds />
      </ProtectedRoute>
    }
  />

  <Route
    path="/create"
    element={
      <ProtectedRoute>
        <CreateHub />
      </ProtectedRoute>
    }
  />

  <Route
    path="/create-world"
    element={
      <ProtectedRoute>
        <CreateWorld />
      </ProtectedRoute>
    }
  />

  <Route
    path="/create-creation"
    element={
      <ProtectedRoute>
        <CreateCreation />
      </ProtectedRoute>
    }
  />

  <Route
    path="/world/:slug"
    element={
      <ProtectedRoute>
        <World />
      </ProtectedRoute>
    }
  />

  <Route
    path="/creation/:slug"
    element={
      <ProtectedRoute>
        <Creation />
      </ProtectedRoute>
    }
  />

  <Route
    path="/creation/:slug/edit"
    element={
      <ProtectedRoute>
        <EditCreation />
      </ProtectedRoute>
    }
  />

  <Route
    path="/ai"
    element={
      <ProtectedRoute>
        <AI />
      </ProtectedRoute>
    }
  />

  <Route
    path="/profile"
    element={
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    }
  />

  <Route
    path="/settings"
    element={
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    }
  />
</Routes>
            </div>

            <footer className="realm-footer">
              <div className="realm-footer-brand">
                REALM
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
    </AuthProvider>
  )
}

export default App

