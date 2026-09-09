import React, { useEffect, useState } from 'react'
import { Check, Globe, Loader2, Lock, Upload, X } from 'lucide-react'


import { saveWorld } from '../../data/worldStore'

export default function WorldForm({
  mode = 'create',
  world,
  onSuccess,
  submitLabel,
}) {
  const isCreate = mode === 'create'

  const [name, setName] = useState(world?.name || '')
  const [slug, setSlug] = useState(world?.slug || '')
  const [slugTouched, setSlugTouched] = useState(false)
  const [description, setDescription] = useState(world?.description || '')
  const [avatar, setAvatar] = useState(world?.avatar || '')
  const [banner, setBanner] = useState(world?.banner || '')
  const [visibility, setVisibility] = useState(
    world?.visibility || 'public'
  )

  const [loading, setLoading] = useState(false)
  const [uploadingField, setUploadingField] = useState(null)
  const [error, setError] = useState('')
  const [slugStatus, setSlugStatus] = useState(null)

  useEffect(() => {
    if (!isCreate) return

    if (!slug) {
      setSlugStatus(null)
      return
    }

    if (!isValidSlug(slug)) {
      setSlugStatus({
        valid: false,
        reason:
          'Slug must be 3-30 characters using lowercase letters, numbers, and hyphens.',
      })
      return
    }

    setSlugStatus({ valid: true })
  }, [slug, isCreate])

  const handleNameChange = (event) => {
    const value = event.target.value

    setName(value)

    if (isCreate && !slugTouched) {
      setSlug(slugify(value))
    }
  }

  const handleImageUpload = (event, field) => {
    const file = event.target.files?.[0]

    if (!file) return

    setUploadingField(field)

    const reader = new FileReader()

    reader.onload = () => {
      if (field === 'avatar') {
        setAvatar(reader.result)
      } else {
        setBanner(reader.result)
      }

      setUploadingField(null)
    }

    reader.onerror = () => {
      setError(`Failed to upload ${field}. Please try again.`)
      setUploadingField(null)
    }

    reader.readAsDataURL(file)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')

    if (name.trim().length < 3 || name.trim().length > 60) {
      setError('Name must be 3-60 characters')
      return
    }

    if (description.length > 500) {
      setError('Description must be 500 characters or fewer')
      return
    }

    if (isCreate) {
      if (!isValidSlug(slug)) {
        setError(
          'Slug must be 3-30 characters using lowercase letters, numbers, and hyphens.'
        )
        return
      }

      if (slugStatus?.valid === false) {
        setError(slugStatus.reason || 'That slug is already taken')
        return
      }
    }

    setLoading(true)

    try {
      /*
       * Local REALM foundation:
       * The Base44 version sends this payload to the backend.
       * We keep the same payload shape here so the backend can be
       * connected later without redesigning the form.
       */
      const resultWorld = {
  ...(world || {}),
  name: name.trim(),
  slug: slug.toLowerCase(),
  description: description.trim(),
  visibility,
  ...(isCreate && !world?.createdAt
    ? { createdAt: new Date().toISOString() }
    : {}),
  ...(avatar ? { avatar } : {}),
  ...(banner ? { banner } : {}),
}

      // Small delay preserves the Base44 loading interaction visually.
      await new Promise((resolve) => setTimeout(resolve, 350))

const savedWorld = saveWorld({
  ...resultWorld,
  id: resultWorld.id || crypto.randomUUID(),
  category: resultWorld.category || 'Community',
  members: resultWorld.members || 1,
  creations: resultWorld.creations || 0,
  featured: resultWorld.featured || false,
})

onSuccess?.(savedWorld)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="world-form">
      {error && (
        <div className="world-form-error">
          {error}
        </div>
      )}

      {/* Banner */}
      <div className="world-form-field">
        <label className="world-form-label">
          Banner
        </label>

        <div className="world-banner-preview">
          {banner ? (
            <img
              src={banner}
              alt="World banner"
              className="world-banner-image"
            />
          ) : (
            <div className="realm-aurora world-banner-placeholder" />
          )}
        </div>

        <label className="world-upload-button">
          <span>
            {uploadingField === 'banner' ? (
              <Loader2 size={16} className="world-spin" />
            ) : (
              <Upload size={16} />
            )}

            {uploadingField === 'banner'
              ? 'Uploading…'
              : 'Upload banner'}
          </span>

          <input
            type="file"
            accept="image/*"
            className="world-hidden-input"
            onChange={(event) =>
              handleImageUpload(event, 'banner')
            }
          />
        </label>
      </div>

      {/* Avatar */}
      <div className="world-avatar-row">
        <div className="world-avatar-preview">
          {avatar ? (
            <img
              src={avatar}
              alt="World avatar"
              className="world-avatar-image"
            />
          ) : (
            (name || 'W').charAt(0).toUpperCase()
          )}
        </div>

        <label className="world-upload-button">
          <span>
            {uploadingField === 'avatar' ? (
              <Loader2 size={16} className="world-spin" />
            ) : (
              <Upload size={16} />
            )}

            {uploadingField === 'avatar'
              ? 'Uploading…'
              : 'Upload avatar'}
          </span>

          <input
            type="file"
            accept="image/*"
            className="world-hidden-input"
            onChange={(event) =>
              handleImageUpload(event, 'avatar')
            }
          />
        </label>
      </div>

      {/* Name */}
      <div className="world-form-field">
        <label
          htmlFor="world-name"
          className="world-form-label"
        >
          World name
        </label>

        <input
          id="world-name"
          value={name}
          onChange={handleNameChange}
          maxLength={60}
          placeholder="A name for your World"
          required
          className="world-form-input"
        />
      </div>

      {/* Slug */}
      {isCreate && (
        <div className="world-form-field">
          <label
            htmlFor="world-slug"
            className="world-form-label"
          >
            World slug
          </label>

          <div className="world-slug-wrapper">
            <span className="world-slug-prefix">
              realm.app/world/
            </span>

            <input
              id="world-slug"
              value={slug}
              onChange={(event) => {
                setSlug(event.target.value.toLowerCase())
                setSlugTouched(true)
              }}
              className="world-form-input world-slug-input"
              placeholder="my-world"
            />

            {slugStatus?.valid === true && (
              <Check
                size={16}
                className="world-slug-status world-slug-valid"
              />
            )}

            {slugStatus?.valid === false && (
              <X
                size={16}
                className="world-slug-status world-slug-invalid"
              />
            )}

            {slugStatus?.checking && (
              <Loader2
                size={16}
                className="world-slug-status world-spin"
              />
            )}
          </div>

          {slugStatus?.valid === false && (
            <p className="world-form-error-text">
              {slugStatus.reason}
            </p>
          )}

          <p className="world-form-help">
            3-30 characters: lowercase letters, numbers, and hyphens.
          </p>
        </div>
      )}

      {/* Description */}
      <div className="world-form-field">
        <label
          htmlFor="world-description"
          className="world-form-label"
        >
          Description
        </label>

        <textarea
          id="world-description"
          value={description}
          onChange={(event) =>
            setDescription(event.target.value)
          }
          maxLength={500}
          rows={4}
          placeholder="What is this World about?"
          className="world-form-textarea"
        />

        <p className="world-character-count">
          {description.length}/500
        </p>
      </div>

      {/* Visibility */}
      <div className="world-form-field">
        <label className="world-form-label">
          Visibility
        </label>

        <div className="world-visibility-grid">
          <VisibilityOption
            active={visibility === 'public'}
            onClick={() => setVisibility('public')}
            icon={Globe}
            title="Public"
            desc="Anyone can view and join"
          />

          <VisibilityOption
            active={visibility === 'private'}
            onClick={() => setVisibility('private')}
            icon={Lock}
            title="Private"
            desc="Join requests need approval"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="world-form-actions">
        <button
          type="submit"
          disabled={loading || uploadingField}
          className="world-submit-button"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="world-spin" />
              {isCreate ? 'Creating…' : 'Saving…'}
            </>
          ) : (
            submitLabel ||
            (isCreate ? 'Create World' : 'Save changes')
          )}
        </button>
      </div>
    </form>
  )
}

function VisibilityOption({
  active,
  onClick,
  icon: Icon,
  title,
  desc,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`world-visibility-option ${
        active ? 'active' : ''
      }`}
    >
      <span className="world-visibility-title">
        <Icon size={16} />
        {title}
      </span>

      <span className="world-visibility-description">
        {desc}
      </span>
    </button>
  )
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 30)
}

function isValidSlug(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) &&
    value.length >= 3 &&
    value.length <= 30
}