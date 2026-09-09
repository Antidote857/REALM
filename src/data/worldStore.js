import { worlds as staticWorlds } from './worlds'

const STORAGE_KEY = 'realm-worlds'

function getStoredWorlds() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (!stored) {
      return []
    }

    const parsed = JSON.parse(stored)

    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error(
      'Failed to read REALM Worlds from localStorage:',
      error
    )

    return []
  }
}

export function getWorlds() {
  const storedWorlds = getStoredWorlds()

  return [
    ...staticWorlds,
    ...storedWorlds,
  ]
}

export function getWorldBySlug(slug) {
  const allWorlds = getWorlds()

  return allWorlds.find(
    (world) => world.slug === slug
  )
}

export function saveWorld(world) {
  const storedWorlds = getStoredWorlds()

  const existingIndex = storedWorlds.findIndex(
    (item) => item.id === world.id
  )

  if (existingIndex >= 0) {
    storedWorlds[existingIndex] = world
  } else {
    storedWorlds.push(world)
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(storedWorlds)
  )

  return world
}

export function deleteWorld(id) {
  const storedWorlds = getStoredWorlds()

  const updatedWorlds = storedWorlds.filter(
    (world) => world.id !== id
  )

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedWorlds)
  )
}