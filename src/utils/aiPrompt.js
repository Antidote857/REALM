import { getAIContext } from './aiContext'

const REALM_PLATFORM_KNOWLEDGE = `
REALM is a community platform built around Worlds and Creations.

Worlds are communities organized around shared interests, ideas,
projects, knowledge, or activities.

Creations are pieces of content created by people inside Worlds.

REALM AI can operate in different contexts:
GLOBAL, WORLD, CREATION, and DISCOVERY.

The active context determines what information should be prioritized.

REALM AI must distinguish between information provided by the platform
and information that is not available in the current context.
`

const REALM_GOVERNANCE_RULES = `
REALM AI GOVERNANCE RULES:

1. Do not invent platform information.
2. Do not claim that a World, Creation, member, statistic, or feature
   exists unless it is present in the supplied context.
3. Treat private content as inaccessible.
4. Prefer the active context over unrelated information.
5. If the available context does not contain enough information to answer
   a question, clearly say that the information is not available.
6. Do not pretend to have performed actions that the system has not
   actually performed.
7. Clearly distinguish platform facts from general knowledge.
8. When discussing a Creation, preserve the relationship between the
   Creation and its parent World.
`

function buildGlobalContext(data) {
  if (!data) return ''

  const publicWorlds = data.worlds || []
  const publicCreations = data.creations || []

  const worldContext = publicWorlds.length
    ? publicWorlds
        .map(
          (world) => `
- ${world.name}
  Category: ${world.category}
  Description: ${world.description}
  Members: ${world.members}
  Creations: ${world.creations}
  Visibility: ${world.visibility}
`
        )
        .join('')
    : 'No public Worlds are currently available.'

  const creationContext = publicCreations.length
    ? publicCreations
        .map(
          (creation) => `
- ${creation.title}
  Creator: ${creation.creator.name} (@${creation.creator.username})
  World: ${creation.worldSlug}
  Likes: ${creation.likes}
  Comments: ${creation.comments}
  Summary: ${creation.excerpt}
`
        )
        .join('')
    : 'No public Creations are currently available.'

  return `
PUBLIC REALM PLATFORM DATA:

PUBLIC WORLDS:
${worldContext}

PUBLIC CREATIONS:
${creationContext}
`
}

function buildWorldContext(data) {
  if (!data?.world) return ''

  const { world, creations = [] } = data

  const creationContext = creations.length
    ? creations
        .map(
          (creation) => `
- ${creation.title}
  Creator: ${creation.creator.name} (@${creation.creator.username})
  Likes: ${creation.likes}
  Comments: ${creation.comments}
  Summary: ${creation.excerpt}
`
        )
        .join('')
    : 'No public Creations are currently available.'

  return `
ACTIVE WORLD:

Name: ${world.name}
Category: ${world.category}
Description: ${world.description}
Members: ${world.members}
Creations: ${world.creations}
Visibility: ${world.visibility}

PUBLIC CREATIONS IN THIS WORLD:
${creationContext}
`
}

function buildCreationContext(data) {
  if (!data?.creation) return ''

  const { creation, world } = data

  return `
ACTIVE CREATION:

Title: ${creation.title}
Creator: ${creation.creator.name} (@${creation.creator.username})
World: ${world?.name || 'Unknown'}
Excerpt: ${creation.excerpt}
Content: ${creation.content}
Likes: ${creation.likes}
Comments: ${creation.comments}
Visibility: ${creation.visibility}
`
}

function buildDiscoveryContext(data) {
  if (!data) return ''

  const publicWorlds = data.worlds || []
  const publicCreations = data.creations || []

  const worldContext = publicWorlds.length
    ? publicWorlds
        .map(
          (world) => `
- ${world.name}
  Category: ${world.category}
  Description: ${world.description}
  Members: ${world.members}
  Creations: ${world.creations}
`
        )
        .join('')
    : 'No public Worlds are currently available.'

  const creationContext = publicCreations.length
  ? publicCreations
      .map(
        (creation, index) => `
${index + 1}. ${creation.title}
   Creator: ${creation.creator.name} (@${creation.creator.username})
   World: ${creation.worldSlug}
   Summary: ${creation.excerpt}
`
      )
      .join('')
  : 'No public Creations are currently available.'

  return `
PUBLIC WORLDS AVAILABLE FOR DISCOVERY:
${worldContext}

PUBLIC CREATIONS AVAILABLE FOR DISCOVERY:
${creationContext}

DISCOVERY RANKING:

The Creations above are ordered according to REALM's deterministic
discovery ranking system.

The first Creation is the highest-ranked available Creation,
followed by the second, third, and subsequent Creations.

When a user asks what they should check out, what Creation they should
read first, or asks for recommendations without specifying a topic,
prefer the highest-ranked Creations in this order.

Do not replace REALM's ranking with a personal or subjective ranking.

If the user specifies an interest or topic, use the ranked list to find
the most relevant Creation for that interest while preserving the
REALM discovery ranking as the primary ordering signal.
`
}

export function buildREALMPrompt(searchParams) {
  const aiContext = getAIContext(searchParams)

  let contextualInformation = ''

  if (aiContext.type === 'global') {
    contextualInformation = buildGlobalContext(
      aiContext.data
    )
  }

  if (aiContext.type === 'world') {
    contextualInformation = buildWorldContext(
      aiContext.data
    )
  }

  if (aiContext.type === 'creation') {
    contextualInformation = buildCreationContext(
      aiContext.data
    )
  }

  if (aiContext.type === 'discovery') {
    contextualInformation = buildDiscoveryContext(
      aiContext.data
    )
  }

  return `
${REALM_PLATFORM_KNOWLEDGE}

${REALM_GOVERNANCE_RULES}

ACTIVE AI CONTEXT:

Type: ${aiContext.label}
Title: ${aiContext.title}
Description: ${aiContext.description}

${contextualInformation}

INSTRUCTION:

Respond as REALM AI.

Use the active context and supplied platform information
when answering questions.

If information is unavailable, say so rather than inventing it.
`
}