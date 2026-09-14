
import { createContext, useContext, useEffect, useState } from 'react'
import {
  getCurrentUser,
  login as loginUser,
  logout as logoutUser,
} from '../data/authStore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadCurrentUser() {
      try {
        const currentUser = await getCurrentUser()

        if (mounted) {
          setUser(currentUser)
        }
      } catch (error) {
        console.error(
          'Failed to load authenticated user:',
          error
        )

        if (mounted) {
          setUser(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadCurrentUser()

    return () => {
      mounted = false
    }
  }, [])

  async function login(identifier, password) {
    const authenticatedUser = await loginUser(
      identifier,
      password
    )

    setUser(authenticatedUser)

    return authenticatedUser
  }

  async function logout() {
    await logoutUser()
    setUser(null)
  }

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used inside an AuthProvider'
    )
  }

  return context
}

