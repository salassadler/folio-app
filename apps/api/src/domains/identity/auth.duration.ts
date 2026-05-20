const UNIT_MS = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
} as const

export function parseDurationMs(duration: string, fallbackMs: number): number {
  const match = /^(\d+)([smhd])$/.exec(duration.trim())
  if (!match) return fallbackMs
  const amount = Number(match[1])
  const unit = match[2] as keyof typeof UNIT_MS
  return amount * UNIT_MS[unit]
}

export function getRefreshExpiresMs(): number {
  return parseDurationMs(process.env.REFRESH_TOKEN_EXPIRES_IN ?? '7d', 7 * 86_400_000)
}

export function getRefreshMaxAgeSeconds(): number {
  return Math.floor(getRefreshExpiresMs() / 1_000)
}
