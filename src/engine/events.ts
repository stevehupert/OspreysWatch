// What happened during an action, step by step, for the game log.
//
// The engine reports facts with numbers (who, where, how much); the UI turns them into sentences.
// Reporting is optional: functions that change the game take an `EventSink` as their last argument
// and call it once per event. Leave it out (as the bot does) and nothing is recorded.
// Events never feed back into the game, so the engine stays deterministic either way.

import type { GameResult } from './gameState.ts'
import type { Pos } from './data/scenarioTypes.ts'

export type GameEvent =
  // --- Your plays ---
  /** A card was played, for one of its halves or a generic action. */
  | {
      readonly kind: 'played'
      readonly card: string
      readonly use: 'A' | 'B' | 'move' | 'attack' | 'loot' | 'interact'
      /** The half burns: the card goes to the lost pile (a burned shield goes there when it clears). */
      readonly burned: boolean
    }
  | { readonly kind: 'heroMoved'; readonly from: Pos; readonly to: Pos }
  /** The door opened; `revealed` lists the monsters that appeared behind it. */
  | { readonly kind: 'doorOpened'; readonly revealed: readonly string[] }
  /** Your attack hit a monster: `attack` minus `armor` is `damage`. */
  | {
      readonly kind: 'monsterHit'
      readonly monster: string
      readonly attack: number
      readonly armor: number
      readonly damage: number
      readonly healthBefore: number
      readonly healthAfter: number
    }
  /**
   * A push. It stops early when `blocked` (the monster takes `damage`, ignoring armor) or on Lava
   * (`lava`, also `damage` ignoring armor).
   */
  | {
      readonly kind: 'pushed'
      readonly monster: string
      readonly from: Pos
      readonly to: Pos
      readonly blocked: boolean
      readonly lava: boolean
      readonly damage: number
      readonly healthBefore: number
      readonly healthAfter: number
    }
  | { readonly kind: 'frozen'; readonly monster: string }
  | {
      readonly kind: 'healed'
      readonly amount: number
      readonly healthBefore: number
      readonly healthAfter: number
    }
  /** A shield card went face up. `shield` is your shield now (the best of base and showing cards). */
  | {
      readonly kind: 'shieldShown'
      readonly card: string
      readonly value: number
      readonly shield: number
    }
  | { readonly kind: 'cardsReturned'; readonly cards: readonly string[] }
  | {
      readonly kind: 'looted'
      readonly heal: number
      readonly healthBefore: number
      readonly healthAfter: number
    }
  /** A rest: `lost` goes to the lost pile, `shuffled` cards go back into the draw pile, `drew` are drawn. */
  | {
      readonly kind: 'rested'
      readonly lost: string
      readonly shuffled: number
      readonly drew: number
    }

  // --- The monster phase ---
  /** No monster can act, so no enemy card is flipped. */
  | { readonly kind: 'noMonsterPhase' }
  /** `deckRefilled`: the draw pile was empty, so the discard pile was shuffled into a new one first. */
  | { readonly kind: 'enemyCardFlipped'; readonly card: string; readonly deckRefilled: boolean }
  | {
      readonly kind: 'monsterMoved'
      readonly monster: string
      readonly from: Pos
      readonly to: Pos
    }
  /** The card says to move, but the monster is frozen (it may still attack). */
  | { readonly kind: 'monsterFrozenInPlace'; readonly monster: string }
  /** The monster would attack but is not next to you. */
  | { readonly kind: 'monsterOutOfReach'; readonly monster: string }
  /** Damage = attack + cardBonus + packTactics − shield, never below 0. */
  | {
      readonly kind: 'monsterAttacked'
      readonly monster: string
      readonly attack: number
      readonly cardBonus: number
      readonly packTactics: number
      readonly shield: number
      readonly damage: number
      readonly healthBefore: number
      readonly healthAfter: number
    }
  /** Toxic Fumes while you stand on Mud. Ignores shields. */
  | {
      readonly kind: 'toxicFumes'
      readonly damage: number
      readonly healthBefore: number
      readonly healthAfter: number
    }
  /** Unleash Doom: the whole enemy deck is shuffled together again. */
  | { readonly kind: 'enemyDeckReshuffled' }
  /** Showing shields are cleared after the monster phase; burned ones are lost. */
  | {
      readonly kind: 'shieldsCleared'
      readonly discarded: readonly string[]
      readonly lost: readonly string[]
    }

  // --- End of round and of the game ---
  | { readonly kind: 'roarDiscard'; readonly card: string }
  | { readonly kind: 'roundEnded'; readonly round: number; readonly drew: number }
  | { readonly kind: 'gameOver'; readonly result: GameResult }

export type EventSink = (event: GameEvent) => void

/** The sink used when nobody is listening. */
export const ignoreEvents: EventSink = () => {}
