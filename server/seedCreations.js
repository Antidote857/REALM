import crypto from 'crypto'
import db from './database.js'

const creations = [
  {
    id: 'creation-ai-agent',
    slug: 'building-my-first-ai-agent',
    worldSlug: 'technology',
    title: 'Building My First AI Agent',
    excerpt:
      'I have been experimenting with AI agents and exploring how they can reason about context instead of simply responding to prompts.',
    content:
      'This is a longer-form Creation about experimenting with AI agents, context, and useful workflows.',
    topics: [
      'AI',
      'Artificial Intelligence',
      'AI Agents',
      'Context',
    ],
    likes: 24,
    comments: 8,
    createdAt: '2026-08-30T14:20:00Z',
    visibility: 'public',
    featured: true,
  },
  {
    id: 'creation-react-project',
    slug: 'my-first-react-project',
    worldSlug: 'technology',
    title: 'My First React Project',
    excerpt:
      'What I learned while building a React application from scratch and turning a simple idea into a working product.',
    content:
      'A detailed Creation documenting the development process, lessons learned, and challenges encountered while building a React application.',
    topics: [
      'React',
      'JavaScript',
      'Web Development',
      'Frontend',
    ],
    likes: 17,
    comments: 5,
    createdAt: '2026-08-28T10:15:00Z',
    visibility: 'public',
    featured: false,
  },
  {
    id: 'creation-design-system',
    slug: 'designing-a-better-interface',
    worldSlug: 'creative',
    title: 'Designing a Better Interface',
    excerpt:
      'Exploring how typography, spacing, hierarchy, and simplicity can make digital products easier to understand.',
    content:
      'A Creation exploring interface design principles and the process of improving a digital product through visual hierarchy.',
    topics: [
      'UI Design',
      'UX Design',
      'Typography',
      'Design Systems',
    ],
    likes: 31,
    comments: 11,
    createdAt: '2026-08-27T16:40:00Z',
    visibility: 'public',
    featured: true,
  },
  {
    id: 'creation-world-building',
    slug: 'how-i-started-building',
    worldSlug: 'build',
    title: 'How I Started Building',
    excerpt:
      'The journey from having an idea to actually building something people can use.',
    content:
      'A Creation about moving from ideas to execution, learning through experimentation, and building consistently.',
    topics: [
      'Building',
      'Projects',
      'Entrepreneurship',
      'Product Development',
    ],
    likes: 42,
    comments: 14,
    createdAt: '2026-08-25T09:30:00Z',
    visibility: 'public',
    featured: true,
  },
  {
    id: 'creation-game-world',
    slug: 'designing-a-game-world',
    worldSlug: 'gaming',
    title: 'Designing a Game World',
    excerpt:
      'Thinking about how environments, characters, mechanics, and storytelling come together to create immersive worlds.',
    content:
      'A Creation exploring game-world design and the relationship between gameplay, environment, and narrative.',
    topics: [
      'Game Development',
      'Game Design',
      'World Building',
      'Storytelling',
    ],
    likes: 36,
    comments: 9,
    createdAt: '2026-08-23T13:05:00Z',
    visibility: 'public',
    featured: true,
  },
  {
    id: 'creation-learning-together',
    slug: 'learning-in-public',
    worldSlug: 'learning',
    title: 'Learning in Public',
    excerpt:
      'Why sharing what you learn can make the learning process more useful for everyone around you.',
    content:
      'A Creation exploring collaborative learning, knowledge sharing, and the value of learning alongside other people.',
    topics: [
      'Learning',
      'Education',
      'Knowledge Sharing',
      'Collaboration',
    ],
    likes: 19,
    comments: 6,
    createdAt: '2026-08-21T11:45:00Z',
    visibility: 'public',
    featured: false,
  },
]

const insertCreation = db.prepare(`
  INSERT INTO creations (
    id,
    world_id,
    creator_id,
    slug,
    title,
    excerpt,
    content,
    likes,
    comments,
    visibility,
    featured,
    created_at,
    updated_at
  )
  VALUES (
    @id,
    @worldId,
    NULL,
    @slug,
    @title,
    @excerpt,
    @content,
    @likes,
    @comments,
    @visibility,
    @featured,
    @createdAt,
    @updatedAt
  )
`)

const insertTopic = db.prepare(`
  INSERT INTO creation_topics (
    creation_id,
    topic
  )
  VALUES (
    @creationId,
    @topic
  )
`)

const findWorld = db.prepare(`
  SELECT id
  FROM worlds
  WHERE slug = ?
`)

const findCreation = db.prepare(`
  SELECT id
  FROM creations
  WHERE id = ?
`)

const seedCreation = db.transaction((creation) => {
  const existingCreation = findCreation.get(creation.id)

  if (existingCreation) {
    return {
      status: 'skipped',
      title: creation.title,
    }
  }

  const world = findWorld.get(creation.worldSlug)

  if (!world) {
    throw new Error(
      `World not found for Creation "${creation.title}": ${creation.worldSlug}`
    )
  }

  const updatedAt = creation.createdAt || new Date().toISOString()

  insertCreation.run({
    id: creation.id,
    worldId: world.id,
    slug: creation.slug,
    title: creation.title,
    excerpt: creation.excerpt,
    content: creation.content,
    likes: creation.likes,
    comments: creation.comments,
    visibility: creation.visibility,
    featured: creation.featured ? 1 : 0,
    createdAt: creation.createdAt,
    updatedAt,
  })

  for (const topic of creation.topics) {
    insertTopic.run({
      creationId: creation.id,
      topic,
    })
  }

  return {
    status: 'seeded',
    title: creation.title,
  }
})

for (const creation of creations) {
  const result = seedCreation(creation)

  if (result.status === 'seeded') {
    console.log(`Seeded Creation: ${result.title}`)
  } else {
    console.log(`Skipped existing Creation: ${result.title}`)
  }
}

console.log('Creation seeding complete.')