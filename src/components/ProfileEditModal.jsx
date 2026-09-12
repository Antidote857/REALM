import { useEffect, useState } from 'react'
import {
  Check,
  Loader2,
  Upload,
  X,
} from 'lucide-react'
import Avatar from './Avatar'
import { saveProfile } from '../data/profileStore'

const USERNAME_RE = /^[a-z0-9_]{3,20}$/

function ProfileEditModal({
  profile,
  open,
  onOpenChange,
  onSaved,
}) {
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState('')

  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [usernameStatus, setUsernameStatus] =
    useState(null)

  useEffect(() => {
    if (!open) return

    setDisplayName(profile?.displayName || '')
    setUsername(profile?.username || '')
    setBio(profile?.bio || '')
    setAvatar(profile?.avatar || '')

    setError('')
    setUsernameStatus(null)
  }, [open, profile])

  useEffect(() => {
    if (!open) return

    if (!username) {
      setUsernameStatus(null)
      return
    }

    if (!USERNAME_RE.test(username)) {
      setUsernameStatus('invalid')
      return
    }

    if (username === profile?.username) {
      setUsernameStatus(null)
      return
    }

    setUsernameStatus('available')
  }, [username, open, profile])

  const handleUpload = (event) => {
    const file = event.target.files?.[0]

    if (!file) return

    setUploading(true)
    setError('')

    const reader = new FileReader()

    reader.onload = () => {
      setAvatar(reader.result)
      setUploading(false)
    }

    reader.onerror = () => {
      setError(
        'Failed to load image. Please try again.'
      )
      setUploading(false)
    }

    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    setError('')

    if (!displayName.trim()) {
      setError('Display name is required.')
      return
    }

    if (!USERNAME_RE.test(username)) {
      setError(
        'Username must be 3-20 characters: lowercase letters, numbers, or underscores.'
      )
      return
    }

    if (
      username !== profile?.username &&
      usernameStatus !== 'available'
    ) {
      setError('Please choose a valid username.')
      return
    }

    setSaving(true)

    const updatedProfile = saveProfile({
      displayName: displayName.trim(),
      username: username.toLowerCase(),
      bio: bio.trim(),
      avatar,
    })

    setSaving(false)

    onSaved?.(updatedProfile)
    onOpenChange(false)
  }

  if (!open) {
    return null
  }

  return (
    <div
      className="profile-modal-backdrop"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !saving
        ) {
          onOpenChange(false)
        }
      }}
    >
      <div
        className="profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
      >
        <div className="profile-modal-header">
          <div>
            <h2 id="profile-modal-title">
              Edit profile
            </h2>

            <p>
              Update your REALM identity.
            </p>
          </div>

          <button
            type="button"
            className="profile-modal-close"
            onClick={() => onOpenChange(false)}
            disabled={saving}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="profile-modal-error">
            {error}
          </div>
        )}

        <div className="profile-modal-body">
          <div className="profile-avatar-edit">
            <Avatar
              profile={{
                ...profile,
                avatar,
              }}
              className="profile-edit-avatar"
            />

            <label className="profile-upload-button">
              {uploading ? (
                <Loader2
                  size={16}
                  className="profile-spin"
                />
              ) : (
                <Upload size={16} />
              )}

              {uploading
                ? 'Loading…'
                : 'Change avatar'}

              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
          </div>

          <div className="profile-field">
            <label htmlFor="display-name">
              Display name
            </label>

            <input
              id="display-name"
              type="text"
              value={displayName}
              onChange={(event) =>
                setDisplayName(event.target.value)
              }
              maxLength={40}
              placeholder="Your name"
              autoComplete="off"
            />
          </div>

          <div className="profile-field">
            <label htmlFor="username">
              Username
            </label>

            <div className="profile-username-input">
              <span>@</span>

              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(
                    event.target.value
                      .toLowerCase()
                      .replace(/\s/g, '')
                  )
                }
                maxLength={20}
                placeholder="username"
                autoComplete="off"
              />

              {usernameStatus === 'available' && (
                <Check
                  size={17}
                  className="profile-username-success"
                />
              )}

              {usernameStatus === 'invalid' && (
                <X
                  size={17}
                  className="profile-username-error"
                />
              )}
            </div>

            {usernameStatus === 'invalid' && (
              <p className="profile-field-error">
                3-20 characters: lowercase letters,
                numbers, and underscores.
              </p>
            )}

            <p className="profile-field-help">
              3-20 characters: lowercase letters,
              numbers, and underscores.
            </p>
          </div>

          <div className="profile-field">
            <label htmlFor="profile-bio">
              Bio
            </label>

            <textarea
              id="profile-bio"
              value={bio}
              onChange={(event) =>
                setBio(event.target.value)
              }
              maxLength={200}
              rows={4}
              placeholder="Tell others about yourself"
            />

            <p className="profile-character-count">
              {bio.length}/200
            </p>
          </div>
        </div>

        <div className="profile-modal-footer">
          <button
            type="button"
            className="profile-cancel-button"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="button"
            className="profile-save-button"
            onClick={handleSave}
            disabled={saving || uploading}
          >
            {saving ? (
              <>
                <Loader2
                  size={16}
                  className="profile-spin"
                />
                Saving…
              </>
            ) : (
              'Save changes'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfileEditModal