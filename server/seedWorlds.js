import db from './database.js'

const worlds = [
  {
    id: 'world-tech',
    slug: 'technology',
    name: 'Technology',
    description:
      'A space for builders, developers, engineers, and curious minds exploring what comes next.',
    category: 'Technology',
    visibility: 'public',
    featured: 1,
  },
  {
    id: 'world-creative',
    slug: 'creative',
    name: 'Creative',
    description:
      'A world for artists, designers, writers, storytellers, and people turning ideas into expression.',
    category: 'Creative',
    visibility: 'public',
    featured: 1,
  },
  {
    id: 'world-build',
    slug: 'build',
    name: 'Build',
    description:
      'Turn ideas into projects, projects into products, and experiments into something real.',
    category: 'Building',
    visibility: 'public',
    featured: 1,
  },
  {
    id: 'world-gaming',
    slug: 'gaming',
    name: 'Gaming',
    description:
      'Players, creators, developers, and communities exploring games and the worlds behind them.',
    category: 'Gaming',
    visibility: 'public',
    featured: 0,
  },
  {
    id: 'world-learning',
    slug: 'learning',
    name: 'Learning',
    description:
      'Learn together, share knowledge, ask better questions, and grow through community.',
    category: 'Education',
    visibility: 'public',
    featured: 0,
  },
]

const user = db
  .prepare('SELECT id FROM users ORDER BY created_at ASC LIMIT 1')
  .get()

if (!user) {
  throw new Error(
    'No users found. Log in or register a user before seeding Worlds.'
  )
}

const now = new Date().toISOString()

const seedWorlds = db.transaction(() => {
  for (const world of worlds) {
    const existingWorld = db
      .prepare('SELECT id FROM worlds WHERE slug = ?')
      .get(world.slug)

    if (existingWorld) {
      console.log(
        `Skipping existing World: ${world.name}`
      )

      continue
    }

    db.prepare(`
      INSERT INTO worlds (
        id,
        owner_id,
        slug,
        name,
        description,
        category,
        visibility,
        featured,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      world.id,
      user.id,
      world.slug,
      world.name,
      world.description,
      world.category,
      world.visibility,
      world.featured,
      now,
      now
    )

    db.prepare(`
      INSERT INTO world_members (
        world_id,
        user_id,
        role,
        joined_at
      )
      VALUES (?, ?, ?, ?)
    `).run(
      world.id,
      user.id,
      'owner',
      now
    )

    console.log(
      `Seeded World: ${world.name}`
    )
  }
})

seedWorlds()

console.log('World seeding complete.')