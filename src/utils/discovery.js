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

  const featuredBonus = creation.featured ? 50 : 0

  const recencyBonus =
    getRecencyScore(creation.createdAt) * 30

  return engagement + featuredBonus + recencyBonus
}

export function discoverCreations(creations) {
  return creations
    .filter((creation) => creation.visibility === 'public')
    .map((creation) => ({
      ...creation,
      discoveryScore: getCreationScore(creation),
    }))
    .sort(
      (a, b) =>
        b.discoveryScore - a.discoveryScore
    )
}