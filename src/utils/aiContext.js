import { getWorlds } from '../data/worldStore'
import { getCreations } from '../data/creationStore'
import { discoverCreations } from './discovery'

function getPublicWorlds(worlds) {
  return worlds.filter(
    (world) => world.visibility === 'public'
  )
}

function getPublicCreations(creations) {
  return creations.filter(
    (creation) => creation.visibility === 'public'
  )
}

function buildGlobalContext(worlds, creations) {
  return {
    worlds: getPublicWorlds(worlds),
    creations: getPublicCreations(creations),
  }
}

export function getAIContext(searchParams) {
  const worlds = getWorlds()
  const creations = getCreations()

  const context = searchParams.get('context')
  const slug = searchParams.get('slug')
  const creationId = searchParams.get('id')

  const publicWorlds = getPublicWorlds(worlds)
  const publicCreations = getPublicCreations(creations)

  if (!context || context === 'global') {
    return {
      type: 'global',
      label: 'GLOBAL',
      title: 'REALM AI',
      description:
        'AI that understands REALM, its Worlds, Creations, and communities.',
      data: buildGlobalContext(worlds, creations),
    }
  }

  if (context === 'world') {
    const world = worlds.find(
      (item) => item.slug === slug
    )

    if (!world || world.visibility !== 'public') {
      return {
        type: 'global',
        label: 'GLOBAL',
        title: 'REALM AI',
        description:
          'The requested World could not be found or is not publicly available. Returning to the global REALM context.',
        data: buildGlobalContext(worlds, creations),
      }
    }

    const worldCreations = publicCreations.filter(
      (creation) =>
        creation.worldSlug === world.slug
    )

    return {
      type: 'world',
      label: 'WORLD',
      title: `${world.name} AI`,
      description:
        `AI focused on the ${world.name} World.`,
      data: {
        world,
        creations: worldCreations,
      },
    }
  }

  if (context === 'creation') {
    const creation = creations.find(
      (item) => item.id === creationId
    )

    if (
      !creation ||
      creation.visibility !== 'public'
    ) {
      return {
        type: 'global',
        label: 'GLOBAL',
        title: 'REALM AI',
        description:
          'The requested Creation could not be found or is not publicly available. Returning to the global REALM context.',
        data: buildGlobalContext(worlds, creations),
      }
    }

    const world = worlds.find(
      (item) => item.slug === creation.worldSlug
    )

    return {
      type: 'creation',
      label: 'CREATION',
      title: creation.title,
      description:
        `AI focused on the Creation "${creation.title}".`,
      data: {
        creation,
        world: world || null,
      },
    }
  }

  if (context === 'discovery') {
    const rankedCreations =
      discoverCreations(publicCreations)

    return {
      type: 'discovery',
      label: 'DISCOVERY',
      title: 'Discovery AI',
      description:
        'AI focused on helping people discover Worlds and Creations across REALM.',
      data: {
        worlds: publicWorlds,
        creations: rankedCreations,
      },
    }
  }

  return {
    type: 'global',
    label: 'GLOBAL',
    title: 'REALM AI',
    description:
      'Unknown AI context. Returning to the global REALM context.',
    data: buildGlobalContext(worlds, creations),
  }
}