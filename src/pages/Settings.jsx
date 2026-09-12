import { useState } from 'react'
import {
  AtSign,
  CalendarDays,
  KeyRound,
  LogOut,
  Mail,
  Pencil,
} from 'lucide-react'
import { getProfile } from '../data/profileStore'
import Avatar from '../components/Avatar'
import ProfileEditModal from '../components/ProfileEditModal'

function Settings() {
  const [profile, setProfile] = useState(getProfile)
  const [editOpen, setEditOpen] = useState(false)

  const handleProfileSaved = (updatedProfile) => {
    setProfile(updatedProfile)
  }

  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '—'

  return (
    <section className="settings-page">
      <header className="settings-header">
        <span className="eyebrow">ACCOUNT</span>

        <h1>Settings</h1>

        <p>Manage your account and identity.</p>
      </header>

      <SettingsSection
        title="Profile"
        description="Your REALM identity."
      >
        <div className="settings-profile">
          <Avatar
            profile={profile}
            className="settings-avatar"
          />

          <div className="settings-profile-info">
            <strong>
              {profile.displayName || profile.username || 'Unnamed'}
            </strong>

            <span>
              {profile.username
                ? `@${profile.username}`
                : 'No username set'}
            </span>
          </div>

          <button
            type="button"
            className="settings-outline-button"
            onClick={() => setEditOpen(true)}
          >
            <Pencil size={16} />
            Edit
          </button>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Account"
        description="Your account details."
      >
        <SettingsRow
          icon={Mail}
          label="Email"
          value={profile.email || 'Not connected'}
        />

        <SettingsRow
          icon={AtSign}
          label="Username"
          value={
            profile.username
              ? `@${profile.username}`
              : 'Not set'
          }
        />

        <SettingsRow
          icon={CalendarDays}
          label="Member since"
          value={memberSince}
        />
      </SettingsSection>

      <SettingsSection
        title="Security"
        description="Password and session."
      >
        <SettingsRow
          icon={KeyRound}
          label="Password"
          value="••••••••"
        />

        <div className="settings-security-actions">
          <button
            type="button"
            className="settings-outline-button"
            disabled
          >
            Change password
          </button>

          <button
            type="button"
            className="settings-logout-button"
            disabled
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>

        <p className="settings-coming-note">
          Authentication and password management will be
          connected when REALM's account system is introduced.
        </p>
      </SettingsSection>

      <p className="settings-footer-note">
        More settings — privacy, notifications, and governance —
        will arrive as REALM grows.
      </p>

      <ProfileEditModal
        profile={profile}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={handleProfileSaved}
      />
    </section>
  )
}

function SettingsSection({
  title,
  description,
  children,
}) {
  return (
    <section className="settings-section">
      <div className="settings-section-header">
        <h2>{title}</h2>

        {description && (
          <p>{description}</p>
        )}
      </div>

      {children}
    </section>
  )
}

function SettingsRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="settings-row">
      <Icon size={17} />

      <span className="settings-row-label">
        {label}
      </span>

      <span className="settings-row-value">
        {value}
      </span>
    </div>
  )
}

export default Settings