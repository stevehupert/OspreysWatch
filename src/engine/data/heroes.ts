// Hero stats from docs/rules-spec.md sections 3 and 10.

export interface HeroStats {
  readonly maxHealth: number
  readonly baseShield: number
}

export const heroStats = {
  warrior: { maxHealth: 10, baseShield: 1 },
  mage: { maxHealth: 7, baseShield: 0 },
} as const satisfies Record<string, HeroStats>

export type HeroId = keyof typeof heroStats
