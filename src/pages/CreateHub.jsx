import React from 'react'
import { Link } from 'react-router-dom'
import { Boxes, Sparkles } from 'lucide-react'

export default function CreateHub() {
  return (
    <div className="create-hub">
      <header className="create-hub-header">
        <span className="create-hub-eyebrow">
          <Sparkles size={14} />
          Create
        </span>

        <h1>What will you bring into REALM?</h1>

        <p>
          Choose what to build. Everything in REALM lives inside a World.
        </p>
      </header>

      <div className="create-hub-options">
        <CreateOption
          to="/create-creation"
          icon={Sparkles}
          title="Create a Creation"
          desc="Publish a project, artwork, writing, music, video, code, or something new inside a World."
        />

        <CreateOption
          to="/create-world"
          icon={Boxes}
          title="Create a World"
          desc="Shape a new digital space for community and creation to grow within."
        />
      </div>
    </div>
  )
}

function CreateOption({ to, icon: Icon, title, desc }) {
  return (
    <Link to={to} className="create-option">
      <span className="create-option-icon">
        <Icon size={20} />
      </span>

      <h2>{title}</h2>

      <p>{desc}</p>
    </Link>
  )
}