// Hero stats from docs/rules-spec.md sections 3 and 10.

export interface HeroStats {
  readonly maxHealth: number
  readonly baseShield: number
}

export const heroStats = {
  warrior: { maxHealth: 10, baseShield: 1 },
  mage: { maxHealth: 8, baseShield: 1 },
} as const satisfies Record<string, HeroStats>
