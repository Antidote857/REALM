import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import './App.css'

import Home from './pages/Home'
import Worlds from './pages/Worlds'
import World from './pages/World'
import Creation from './pages/Creation'
import Explore from './pages/Explore'
import AI from './pages/AI'
import Profile from './pages/Profile'

function App() {
  return (
    <BrowserRouter>
      <div className="realm-app">
        <header className="realm-header">
          <Link to="/" className="realm-brand">
            <div className="realm-mark">R</div>
            <span>REALM</span>
          </Link>

          <nav className="realm-nav">
            <Link to="/">Home</Link>
            <Link to="/worlds">Worlds</Link>
            <Link to="/explore">Explore</Link>
            <Link to="/ai">AI</Link>
          </nav>

          <div className="realm-actions">
            <Link to="/profile" className="ghost-button">
              Profile
            </Link>

            <Link to="/worlds" className="primary-button">
              Enter REALM
            </Link>
          </div>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/worlds" element={<Worlds />} />
            <Route path="/world/:slug" element={<World />} />
            <Route path="/creation/:slug" element={<Creation />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/ai" element={<AI />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>

        <footer className="realm-footer">
          <div className="realm-brand">
            <div className="realm-mark">R</div>
            <span>REALM</span>
          </div>

          <p>
            Communities where AI makes the community smarter.
          </p>

          <span className="footer-status">
            BUILDING REALM • v0.1
          </span>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App