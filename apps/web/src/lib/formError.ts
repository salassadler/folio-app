import { TRPCClientError } from '@trpc/client'
import type { ZodError } from 'zod'

export function zodErrorMessage(error: ZodError): string {
  return error.issues[0]?.message ?? 'Please check your input.'
}

export function mutationErrorMessage(error: unknown): string {
  if (error instanceof TRPCClientError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Something went wrong. Please try again.'
}
