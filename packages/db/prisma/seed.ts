import { PrismaClient, MembershipRole } from '@prisma/client'
import argon2 from 'argon2'

const db = new PrismaClient()

async function main() {
  console.warn('Seeding database...')

  const password = await argon2.hash('password123')

  const alice = await db.user.upsert({
    where: { email: 'alice@folio.dev' },
    update: {},
    create: {
      email: 'alice@folio.dev',
      passwordHash: password,
      name: 'Alice Writer',
      bio: 'Poet and short story writer.',
    },
  })

  const bob = await db.user.upsert({
    where: { email: 'bob@folio.dev' },
    update: {},
    create: {
      email: 'bob@folio.dev',
      passwordHash: password,
      name: 'Bob Reader',
      bio: 'Avid reader and literary critic.',
    },
  })

  const workshop = await db.organization.upsert({
    where: { slug: 'midnight-ink' },
    update: {},
    create: {
      name: 'Midnight Ink',
      slug: 'midnight-ink',
      description: 'A workshop for poets and short fiction writers.',
      rules: 'Be constructive. Be specific. Be kind.',
      isPublic: true,
    },
  })

  await db.membership.upsert({
    where: { userId_organizationId: { userId: alice.id, organizationId: workshop.id } },
    update: {},
    create: { userId: alice.id, organizationId: workshop.id, role: MembershipRole.OWNER },
  })

  await db.membership.upsert({
    where: { userId_organizationId: { userId: bob.id, organizationId: workshop.id } },
    update: {},
    create: { userId: bob.id, organizationId: workshop.id, role: MembershipRole.MEMBER },
  })

  console.warn(`Seeded:
  - Users: alice@folio.dev, bob@folio.dev (password: password123)
  - Workshop: "Midnight Ink" (slug: midnight-ink)
  - alice is OWNER, bob is MEMBER

  Use X-Dev-User-Id header in dev:
    alice: ${alice.id}
    bob:   ${bob.id}
  `)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
