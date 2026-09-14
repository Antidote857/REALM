
const API_BASE_URL = 'http://localhost:3001'

export async function getCurrentUser() {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/me`,
    {
      credentials: 'include',
    }
  )

  if (response.status === 401) {
    return null
  }

  if (!response.ok) {
    throw new Error(
      'Failed to retrieve authenticated user.'
    )
  }

  const data = await response.json()

  return data.user || null
}

export async function login(identifier, password) {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        identifier,
        password,
      }),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.error || 'Unable to log in.'
    )
  }

  const authenticatedUser =
    await getCurrentUser()

  if (!authenticatedUser) {
    throw new Error(
      'Login succeeded, but the authenticated user could not be retrieved.'
    )
  }

  return authenticatedUser
}

export async function logout() {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/logout`,
    {
      method: 'POST',
      credentials: 'include',
    }
  )

  if (!response.ok) {
    throw new Error('Failed to log out.')
  }

  return true
}

