import React from 'react'
import { Sparkles } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import CreationForm from './CreationForm'

export default function CreateCreation() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const initialWorldId = searchParams.get('world') || ''

  const handleSuccess = (creation) => {
  if (creation?.slug) {
    navigate(`/creation/${creation.slug}`)
  }
}

  return (
    <div className="create-creation-page">
      <header className="create-creation-header">
        <span className="create-creation-eyebrow">
          <Sparkles size={14} />
          New Creation
        </span>

        <h1>Publish a Creation</h1>

        <p>
          Share something you've made inside one of your Worlds.
        </p>
      </header>

      <div className="create-creation-card">
        <CreationForm
          mode="create"
          initialWorldId={initialWorldId}
          onSuccess={handleSuccess}
          submitLabel="Publish Creation"
        />
      </div>
    </div>
  )
}