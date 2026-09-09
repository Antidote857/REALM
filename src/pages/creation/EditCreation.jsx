import { Link, useNavigate, useParams } from 'react-router-dom'
import { Pencil } from 'lucide-react'

import { getCreationBySlug } from '../../data/creationStore'
import CreationForm from './CreationForm'

export default function EditCreation() {
  const navigate = useNavigate()
  const { slug } = useParams()

  const creation = getCreationBySlug(slug)

  if (!creation) {
    return (
      <section className="realm-page">
        <span className="eyebrow">404</span>

        <h1>Creation not found.</h1>

        <p>
          The Creation you're trying to edit doesn't exist
          or is no longer available.
        </p>

        <Link
          to="/worlds"
          className="primary-button"
        >
          Back to Worlds
        </Link>
      </section>
    )
  }

  const handleSuccess = (updatedCreation) => {
    if (updatedCreation?.slug) {
      navigate(`/creation/${updatedCreation.slug}`)
    }
  }

  return (
    <div className="create-creation-page">
      <header className="create-creation-header">
        <span className="create-creation-eyebrow">
          <Pencil size={14} />
          Edit Creation
        </span>

        <h1>Edit your Creation</h1>

        <p>
          Update your Creation and keep its place within REALM.
        </p>
      </header>

      <div className="create-creation-card">
        <CreationForm
          mode="edit"
          creation={creation}
          onSuccess={handleSuccess}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  )
}