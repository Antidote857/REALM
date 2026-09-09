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
    creation.likes * 1 +
    creation.comments * 2

  const featuredBonus =
    creation.featured ? 50 : 0

  const recencyBonus =
    getRecencyScore(creation.createdAt) * 30

  return engagement + featuredBonus + recencyBonus
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

export function discoverWorlds(worlds, creations = []) {
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