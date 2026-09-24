import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Pencil, Trash2, Loader2 } from 'lucide-react'

import CreationForm from './CreationForm'

export default function EditCreation() {
  const navigate = useNavigate()
  const { slug } = useParams()

  const [creation, setCreation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadCreation() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `http://localhost:3001/api/creations/${encodeURIComponent(slug)}`,
          {
            credentials: 'include',
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data?.error || 'Failed to load Creation.'
          )
        }

        if (!mounted) return

        setCreation(data?.creation || null)
      } catch (err) {
        console.error(
          'Failed to load Creation for editing:',
          err
        )

        if (!mounted) return

        setError(
          err?.message ||
            'Failed to load Creation.'
        )
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    if (slug) {
      loadCreation()
    }

    return () => {
      mounted = false
    }
  }, [slug])

  const handleSuccess = (updatedCreation) => {
    if (updatedCreation?.slug) {
      navigate(
        `/creation/${updatedCreation.slug}`
      )
    }
  }

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${creation.title}"? This action cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(
        `http://localhost:3001/api/creations/${creation.id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Failed to delete Creation.'
        )
      }

      navigate(
        `/world/${
          creation.world?.slug ||
          creation.worldSlug ||
          ''
        }`
      )
    } catch (err) {
      console.error(
        'Failed to delete Creation:',
        err
      )

      window.alert(
        err?.message ||
          'Failed to delete Creation.'
      )
    }
  }

  if (loading) {
    return (
      <section className="realm-page">
        <Loader2
          size={22}
          className="creation-spin"
        />

        <p>Loading Creation…</p>
      </section>
    )
  }

  if (error || !creation) {
    return (
      <section className="realm-page">
        <span className="eyebrow">404</span>

        <h1>Creation not found.</h1>

        <p>
          {error ||
            "The Creation you're trying to edit doesn't exist or is no longer available."}
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

        <div className="creation-delete-section">
          <div>
            <span className="creation-delete-label">
              DANGER ZONE
            </span>

            <h3>Delete this Creation</h3>

            <p>
              Permanently remove this Creation from REALM.
            </p>
          </div>

          <button
            type="button"
            className="creation-delete-button"
            onClick={handleDelete}
          >
            <Trash2
              size={15}
              strokeWidth={1.8}
            />

            <span>Delete Creation</span>
          </button>
        </div>
      </div>
    </div>
  )
}