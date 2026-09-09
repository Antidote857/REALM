
import { creations as staticCreations } from './creations'

const STORAGE_KEY = 'realm-creations'

function getStoredCreations() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (!stored) {
      return []
    }

    const parsed = JSON.parse(stored)

    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error(
      'Failed to read REALM Creations from localStorage:',
      error
    )

    return []
  }
}

export function getCreations() {
  const storedCreations = getStoredCreations()

  return [
    ...staticCreations,
    ...storedCreations,
  ]
}

export function getCreationBySlug(slug) {
  const allCreations = getCreations()

  return allCreations.find(
    (creation) => creation.slug === slug
  )
}

export function getCreationsByWorld(worldSlug) {
  const allCreations = getCreations()

  return allCreations.filter(
    (creation) =>
      creation.worldSlug === worldSlug
  )
}

export function saveCreation(creation) {
  const storedCreations = getStoredCreations()

  const existingIndex = storedCreations.findIndex(
    (item) => item.id === creation.id
  )

  if (existingIndex >= 0) {
    storedCreations[existingIndex] = creation
  } else {
    storedCreations.push(creation)
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(storedCreations)
  )

  return creation
}

export function deleteCreation(id) {
  const storedCreations = getStoredCreations()

  const updatedCreations =
    storedCreations.filter(
      (creation) => creation.id !== id
    )

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedCreations)
  )
}

