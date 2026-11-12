// The shape of a recorded reference game (see warriorReference.ts and mageReference.ts).

import type { CardDefinition } from '../data/cardTypes.ts'
import type { HeroId } from '../data/heroes.ts'
import type { GameResult } from '../gameState.ts'

export interface RefPos {
  readonly row: number
  readonly col: number
}

export type RefAction =
  | {
      readonly type: 'play'
      readonly card: string
      readonly use: 'A' | 'B' | 'move' | 'attack' | 'loot'
      readonly to?: RefPos
      readonly target?: string
      readonly second?: string
      readonly axis?: 'row' | 'col'
      readonly returns?: readonly string[]
    }
  | { readonly type: 'rest'; readonly lose: string }
  | { readonly type: 'discard'; readonly card: string }

export interface RefSnapshot {
  readonly round: number
  readonly result: GameResult | null
  readonly hp: number
  readonly pos: RefPos
  readonly doorOpen: boolean
  readonly looted: boolean
  readonly monsters: Readonly<Record<string, { pos: RefPos; hp: number; revealed: boolean }>>
  /** Sorted by name. */
  readonly hand: readonly string[]
  /** Top of the draw pile first. */
  readonly draw: readonly string[]
  readonly discard: readonly string[]
  readonly lost: readonly string[]
  readonly showing: readonly string[]
}

export interface ReferenceGame {
  readonly name: string
  readonly hero: HeroId
  /**
   * Cards whose definition has changed since the game was recorded. The replay uses these
   * instead of the current cards with the same id, so the game still plays out as recorded.
   */
  readonly cardsAsRecorded?: readonly CardDefinition[]
  /** Starting deck order: the first five are the opening hand. */
  readonly deal: readonly string[]
  /** Enemy deck order at the start, top first. */
  readonly enemyOrder: readonly string[]
  /** For reading only: the enemy cards flipped, in order. */
  readonly flipsUsed: readonly string[]
  /** The order each hero-deck shuffle (a Rest) produced, in the order they happened. */
  readonly heroShuffles: readonly (readonly string[])[]
  /** The order each enemy-deck reshuffle (after Unleash Doom) produced. */
  readonly enemyShuffles: readonly (readonly string[])[]
  readonly rounds: readonly {
    readonly actions: readonly RefAction[]
    readonly after: RefSnapshot
  }[]
  readonly result: GameResult
  readonly roundsPlayed: number
}
