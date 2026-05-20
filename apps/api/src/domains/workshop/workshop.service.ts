import { MembershipRole, Prisma, prisma } from '@folio/db'
import type { CreateWorkshopInput } from '@folio/shared'

function isSlugConflict(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002' &&
    Array.isArray(error.meta?.target) &&
    (error.meta.target as string[]).includes('slug')
  )
}

export async function createWorkshop(userId: string, data: CreateWorkshopInput) {
  try {
    return await prisma.workshop.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        rules: data.rules ?? null,
        isPublic: data.isPublic,
        noCopyPaste: data.noCopyPaste,
        memberships: {
          create: {
            userId,
            role: MembershipRole.OWNER,
          },
        },
      },
    })
  } catch (error) {
    if (isSlugConflict(error)) {
      throw new Error('Slug already in use')
    }
    throw error
  }
}

export async function getWorkshop(workshopId: string) {
  const workshop = await prisma.workshop.findUnique({
    where: { id: workshopId },
  })
  if (!workshop) {
    throw new Error('Workshop not found')
  }
  return workshop
}

export async function updateWorkshop(workshopId: string, data: CreateWorkshopInput) {
  try {
    return await prisma.workshop.update({
      where: { id: workshopId },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        rules: data.rules ?? null,
        isPublic: data.isPublic,
        noCopyPaste: data.noCopyPaste,
      },
    })
  } catch (error) {
    if (isSlugConflict(error)) {
      throw new Error('Slug already in use')
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new Error('Workshop not found')
    }
    throw error
  }
}

export async function deleteWorkshop(workshopId: string) {
  try {
    return await prisma.workshop.delete({
      where: { id: workshopId },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new Error('Workshop not found')
    }
    throw error
  }
}

export async function listWorkshopsForUser(userId: string) {
  return prisma.workshop.findMany({
    where: {
      memberships: {
        some: { userId },
      },
    },
    orderBy: { name: 'asc' },
  })
}
