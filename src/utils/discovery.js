function getRecencyScore(createdAt) {
  const ageInDays =
    (Date.now() - new Date(createdAt).getTime()) /
    (1000 * 60 * 60 * 24)

  if (ageInDays <= 1) return 1
  if (ageInDays <= 3) return 0.8
  if (ageInDays <= 7) return 0.6
  if (ageInDays <= 14) return 0.4
  return 0.2
}

function getCreationScore(creation) {
  const engagement =
    (Number(creation.likes) || 0) * 1 +
    (Number(creation.comments) || 0) * 2

  const featuredBonus =
    creation.featured ? 50 : 0

  const recencyBonus =
    getRecencyScore(creation.createdAt) * 30

  return (
    engagement +
    featuredBonus +
    recencyBonus
  )
}

export function discoverCreations(creations) {
  return creations
    .filter(
      (creation) => creation.visibility === 'public'
    )
    .map((creation) => ({
      ...creation,
      discoveryScore: getCreationScore(creation),
    }))
    .sort(
      (a, b) =>
        b.discoveryScore - a.discoveryScore
    )
}

function getWorldScore(world, creations) {
  const members =
    Number(world.members) || 0

  const publicCreations = creations.filter(
    (creation) =>
      creation.worldSlug === world.slug &&
      creation.visibility === 'public'
  )

  const creationCount =
    publicCreations.length

  const featuredBonus =
    world.featured ? 50 : 0

  const memberScore =
    members * 0.02

  const creationScore =
    creationCount * 10

  return (
    memberScore +
    creationScore +
    featuredBonus
  )
}

export function discoverWorlds(
  worlds,
  creations = []
) {
  return worlds
    .filter(
      (world) => world.visibility === 'public'
    )
    .map((world) => ({
      ...world,
      discoveryScore: getWorldScore(
        world,
        creations
      ),
    }))
    .sort(
      (a, b) =>
        b.discoveryScore - a.discoveryScore
    )
}

export function sortCreationsByMode(
  creations,
  mode = 'recommended'
) {
  const publicCreations =
    creations.filter(
      (creation) =>
        creation.visibility === 'public'
    )

  switch (mode) {
    case 'trending':
      return [...publicCreations].sort(
        (a, b) => {
          const scoreA =
            (Number(a.likes) || 0) +
            (Number(a.comments) || 0) * 2

          const scoreB =
            (Number(b.likes) || 0) +
            (Number(b.comments) || 0) * 2

          return scoreB - scoreA
        }
      )

    case 'newest':
      return [...publicCreations].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )

    case 'most-active':
      return [...publicCreations].sort(
        (a, b) => {
          const activityA =
            (Number(a.likes) || 0) +
            (Number(a.comments) || 0) * 2

          const activityB =
            (Number(b.likes) || 0) +
            (Number(b.comments) || 0) * 2

          return activityB - activityA
        }
      )

    case 'recommended':
    default:
      return discoverCreations(
        publicCreations
      )
  }
}

export function sortWorldsByMode(
  worlds,
  creations = [],
  mode = 'recommended'
) {
  const publicWorlds =
    worlds.filter(
      (world) => world.visibility === 'public'
    )

  switch (mode) {
    case 'trending':
      return [...publicWorlds].sort(
        (a, b) => {
          const creationsA =
            creations.filter(
              (creation) =>
                creation.worldSlug === a.slug &&
                creation.visibility === 'public'
            ).length

          const creationsB =
            creations.filter(
              (creation) =>
                creation.worldSlug === b.slug &&
                creation.visibility === 'public'
            ).length

          const scoreA =
            (Number(a.members) || 0) * 0.05 +
            creationsA * 2

          const scoreB =
            (Number(b.members) || 0) * 0.05 +
            creationsB * 2

          return scoreB - scoreA
        }
      )

    case 'newest':
      return [...publicWorlds].sort(
        (a, b) => {
          const dateA = a.createdAt
            ? new Date(a.createdAt).getTime()
            : 0

          const dateB = b.createdAt
            ? new Date(b.createdAt).getTime()
            : 0

          return dateB - dateA
        }
      )

    case 'most-active':
      return [...publicWorlds].sort(
        (a, b) => {
          const creationsA =
            creations.filter(
              (creation) =>
                creation.worldSlug === a.slug &&
                creation.visibility === 'public'
            ).length

          const creationsB =
            creations.filter(
              (creation) =>
                creation.worldSlug === b.slug &&
                creation.visibility === 'public'
            ).length

          const activityA =
            (Number(a.members) || 0) +
            creationsA * 10

          const activityB =
            (Number(b.members) || 0) +
            creationsB * 10

          return activityB - activityA
        }
      )

    case 'recommended':
    default:
      return discoverWorlds(
        publicWorlds,
        creations
      )
  }
}