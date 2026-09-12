const STORAGE_KEY = 'realm-profile'

const DEFAULT_PROFILE = {
  displayName: 'Antidote857',
  username: 'antidote857',
  bio: '',
  avatar: '',
  email: '',
  createdAt: null,
}

function getStoredProfile() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (!stored) {
      return null
    }

    const parsed = JSON.parse(stored)

    return parsed && typeof parsed === 'object'
      ? parsed
      : null
  } catch (error) {
    console.error('Failed to read REALM profile:', error)
    return null
  }
}

export function getProfile() {
  return {
    ...DEFAULT_PROFILE,
    ...getStoredProfile(),
  }
}

export function saveProfile(profile) {
  const currentProfile = getProfile()

  const updatedProfile = {
    ...currentProfile,
    ...profile,
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedProfile)
  )

  return updatedProfile
}

export function resetProfile() {
  localStorage.removeItem(STORAGE_KEY)
  return getProfile()
}