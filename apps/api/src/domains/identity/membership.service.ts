import type { Membership } from '@folio/db'
import { prisma } from '@folio/db'

export const getMembership = async (
  userId: string,
  workshopId: string,
): Promise<Membership | null> => {
  return prisma.membership.findUnique({
    where: { userId_workshopId: { userId, workshopId } },
  })
}
