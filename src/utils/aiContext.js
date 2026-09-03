import { worlds } from '../data/worlds'
import { creations } from '../data/creations'
import { discoverCreations } from './discovery'

export function getAIContext(searchParams) {
  const context = searchParams.get('context')
  const slug = searchParams.get('slug')
  const creationId = searchParams.get('id')

  if (!context || context === 'global') {
    return {
      type: 'global',
      label: 'GLOBAL',
      title: 'REALM AI',
      description:
        'AI that understands REALM, its Worlds, Creations, and communities.',
      data: {
        worlds: worlds.filter(
          (world) => world.visibility === 'public'
        ),
        creations: creations.filter(
          (creation) => creation.visibility === 'public'
        ),
      },
    }
  }

  if (context === 'world') {
    const world = worlds.find((item) => item.slug === slug)

    if (!world) {
      return {
        type: 'global',
        label: 'GLOBAL',
        title: 'REALM AI',
        description:
          'The requested World could not be found. Returning to the global REALM context.',
        data: {
          worlds: worlds.filter(
            (world) => world.visibility === 'public'
          ),
          creations: creations.filter(
            (creation) => creation.visibility === 'public'
          ),
        },
      }
    }

    const worldCreations = creations.filter(
      (creation) =>
        creation.worldSlug === world.slug &&
        creation.visibility === 'public'
    )

    return {
      type: 'world',
      label: 'WORLD',
      title: `${world.name} AI`,
      description: `AI focused on the ${world.name} World.`,
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

    if (!creation) {
      return {
        type: 'global',
        label: 'GLOBAL',
        title: 'REALM AI',
        description:
          'The requested Creation could not be found. Returning to the global REALM context.',
        data: {
          worlds: worlds.filter(
            (world) => world.visibility === 'public'
          ),
          creations: creations.filter(
            (creation) => creation.visibility === 'public'
          ),
        },
      }
    }

    const world = worlds.find(
      (item) => item.slug === creation.worldSlug
    )

    return {
      type: 'creation',
      label: 'CREATION',
      title: creation.title,
      description: `AI focused on the Creation "${creation.title}".`,
      data: {
        creation,
        world: world || null,
      },
    }
  }

  if (context === 'discovery') {
  const publicWorlds = worlds.filter(
    (world) => world.visibility === 'public'
  )

  const publicCreations = creations.filter(
    (creation) => creation.visibility === 'public'
  )

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
    data: {
      worlds: worlds.filter(
        (world) => world.visibility === 'public'
      ),
      creations: creations.filter(
        (creation) => creation.visibility === 'public'
      ),
    },
  }
}