// Card shapes. For now a half is stored as its rules text plus the two facts the
// deck needs: whether using it burns the card, and its shield value if it has one.
// Structured effects (attack, move, heal, ...) will be added when combat is built.

export interface CardHalf {
  readonly text: string
  /** Using this half sends the card to the lost pile. */
  readonly burn: boolean
  /** Shield value if this half places a showing shield. */
  readonly shield?: number
}

export interface CardDefinition {
  readonly id: string
  readonly name: string
  readonly halfA: CardHalf
  readonly halfB: CardHalf
}
