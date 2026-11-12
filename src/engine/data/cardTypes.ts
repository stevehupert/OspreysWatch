// Card shapes. A half is stored as its rules text plus structured effects the engine can run.
// The text is what the player reads; the effects are what the engine does. A test keeps the two in step.

/** Extra damage an attack deals to other enemies. */
export interface AlsoDamage {
  /**
   * secondAdjacent: one more enemy next to you that you choose (Cleave).
   * adjacentToTarget: every other enemy next to the target (Fireball, Meteor).
   */
  readonly to: 'secondAdjacent' | 'adjacentToTarget'
  readonly damage: number
}

export type Effect =
  | { readonly kind: 'move'; readonly distance: number }
  | {
      readonly kind: 'attack'
      readonly damage: number
      /** Range 1 is a melee attack. */
      readonly range: number
      /** Sweep: hit ALL adjacent enemies instead of choosing one target. */
      readonly area?: 'allAdjacent'
      readonly also?: AlsoDamage
      /** Frost Snare: the target cannot move in the next monster phase. */
      readonly freeze?: boolean
    }
  | { readonly kind: 'push'; readonly distance: number; readonly range: number }
  | { readonly kind: 'heal'; readonly amount: number }
  | { readonly kind: 'shield'; readonly value: number }
  | { readonly kind: 'returnCards'; readonly count: number }

export interface CardHalf {
  readonly text: string
  /** Using this half sends the card to the lost pile. */
  readonly burn: boolean
  /** Shield value if this half places a showing shield. */
  readonly shield?: number
  /** What the half does, in order. */
  readonly effects: readonly Effect[]
}

export interface CardDefinition {
  readonly id: string
  readonly name: string
  readonly halfA: CardHalf
  readonly halfB: CardHalf
}
