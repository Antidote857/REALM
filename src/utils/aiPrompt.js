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

function formatCreator(creation) {
  if (!creation?.creator) {
    return 'Unknown'
  }

  const name =
    creation.creator.name ||
    creation.creator.username ||
    'Unknown'

  const username = creation.creator.username

  if (username) {
    return `${name} (@${username})`
  }

  return name
}

function getCreationWorldName(creation) {
  return creation?.worldSlug || 'Unknown'
}

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
  Creator: ${formatCreator(creation)}
  World: ${getCreationWorldName(creation)}
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

  const {
    world,
    creations = [],
    currentUser,
    userRelationship = 'none',
  } = data

  const creationContext = creations.length
    ? creations
        .map(
          (creation) => `
- ${creation.title}
  Creator: ${formatCreator(creation)}
  Topics: ${
    creation.topics?.length
      ? creation.topics.join(', ')
      : 'None'
  }
  Summary: ${creation.excerpt}
  Content: ${creation.content}
  Likes: ${creation.likes}
  Comments: ${creation.comments}
  Featured: ${creation.featured ? 'Yes' : 'No'}
  Created: ${creation.createdAt}
  Updated: ${creation.updatedAt}
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

CURRENT USER:

Name: ${currentUser?.displayName || currentUser?.username || 'Unknown'}
Username: ${currentUser?.username || 'Unknown'}
Relationship to World: ${userRelationship}

PUBLIC CREATIONS IN THIS WORLD:
${creationContext}
`
}

function buildCreationContext(data) {
  if (!data?.creation) return ''

  const {
    creation,
    world,
    relatedCreations = [],
  } = data

  const relatedCreationContext = relatedCreations.length
    ? relatedCreations
        .map(
          (relatedCreation) => `
- ${relatedCreation.title}
  Creator: ${formatCreator(relatedCreation)}
  Topics: ${
    relatedCreation.topics?.length
      ? relatedCreation.topics.join(', ')
      : 'None'
  }
  Summary: ${relatedCreation.excerpt}
`
        )
        .join('')
    : 'No other public Creations are currently available in this World.'

  return `
ACTIVE CREATION:

Title: ${creation.title}
Creator: ${formatCreator(creation)}
World: ${world?.name || getCreationWorldName(creation)}
Topics: ${
    creation.topics?.length
      ? creation.topics.join(', ')
      : 'None'
  }
Excerpt: ${creation.excerpt}
Content: ${creation.content}
Likes: ${creation.likes}
Comments: ${creation.comments}
Featured: ${creation.featured ? 'Yes' : 'No'}
Visibility: ${creation.visibility}
Created: ${creation.createdAt}
Updated: ${creation.updatedAt}

PARENT WORLD:

Name: ${world?.name || getCreationWorldName(creation)}
Category: ${world?.category || 'Unknown'}
Description: ${world?.description || 'Unavailable'}

OTHER PUBLIC CREATIONS IN THIS WORLD:
${relatedCreationContext}
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
   Creator: ${formatCreator(creation)}
   World: ${getCreationWorldName(creation)}
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

function buildContextInstructions(aiContext) {
  if (aiContext.type === 'world') {
    return `
WORLD-SPECIFIC AI INSTRUCTIONS:

You are the AI intelligence layer for the active World.

Treat the active World as your primary knowledge environment.

Prioritize the World's purpose, description, and public Creations when
answering questions.

Use the Creations collectively to understand the knowledge, ideas,
projects, themes, and activity developing inside this World.

When useful, connect information across multiple Creations to explain
patterns, relationships, shared topics, and differences.

Keep answers focused on the active World unless the user clearly asks
for broader general knowledge.

Do not claim that knowledge, activity, members, or Creations exist in
this World unless they are present in the supplied World context.

If the World context does not contain enough information to answer a
World-specific question, clearly say that the information is not
currently available in this World.
`
  }

  if (aiContext.type === 'creation') {
    return `
CREATION-SPECIFIC AI INSTRUCTIONS:

You are the AI intelligence layer for the active Creation.

Treat the active Creation as your primary knowledge object.

Prioritize the Creation's content, excerpt, topics, creator, metadata,
and relationship to its parent World when answering questions.

Reason deeply about the ideas, knowledge, purpose, and themes contained
in the active Creation.

Use other public Creations in the parent World only when they provide
useful comparison or surrounding context.

Do not attribute information from another Creation to the active
Creation.

Clearly distinguish the active Creation's knowledge from related
knowledge found in other Creations.

Keep answers focused on the active Creation unless the user clearly asks
for broader World or general knowledge.

If the supplied context does not contain enough information to answer a
Creation-specific question, clearly say that the information is not
available in this Creation.
`
  }

  return ''
}

export function buildREALMPrompt(
  searchParams,
  worlds = [],
  creations = [],
  currentUser = null
) {
  const aiContext = getAIContext(
    searchParams,
    worlds,
    creations,
    currentUser
  )

  let contextualInformation = ''

  const contextInstructions =
    buildContextInstructions(aiContext)

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

${contextInstructions}

INSTRUCTION:

Respond as REALM AI.

Use the active context and supplied platform information
when answering questions.

If information is unavailable, say so rather than inventing it.

Use plain text only.
Do not use Markdown formatting.
Do not use asterisks (*), underscores (_), hashtags (#), backticks,
or Markdown bullet syntax.
Use simple paragraphs and numbered lists when a list is necessary.
`
}