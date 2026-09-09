import React from 'react'
import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import WorldForm from '../components/world/WorldForm'

export default function CreateWorld() {
  const navigate = useNavigate()

  const handleSuccess = (world) => {
    if (world?.slug) {
      navigate(`/world/${world.slug}`)
    }
  }

  return (
    <div className="create-world-page">
      <header className="create-world-header">
        <span className="create-world-eyebrow">
          <Plus size={14} />
          New World
        </span>

        <h1>Create a World</h1>

        <p>
          Shape a new digital space for community and creation
          to grow within.
        </p>
      </header>

      <div className="create-world-card">
        <WorldForm
          mode="create"
          onSuccess={handleSuccess}
          submitLabel="Create World"
        />
      </div>
    </div>
  )
}