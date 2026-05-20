import type { Workshop } from '@folio/db'
import type { Workshop as PublicWorkshop } from '@folio/shared'

export function toPublicWorkshop(workshop: Workshop): PublicWorkshop {
  return {
    id: workshop.id,
    name: workshop.name,
    slug: workshop.slug,
    description: workshop.description,
    rules: workshop.rules,
    isPublic: workshop.isPublic,
    noCopyPaste: workshop.noCopyPaste,
    createdAt: workshop.createdAt,
    updatedAt: workshop.updatedAt,
  }
}
