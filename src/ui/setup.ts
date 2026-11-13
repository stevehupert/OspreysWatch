// Which game to play: a hero and a seed for the shuffles.
// The start screen picks them; the page address (?hero=mage&seed=7) can also name them, which
// skips the start screen. Starting a game writes its hero and seed into the address, so reloading
// the page or sharing the link replays the same deal.

import type { HeroId } from '../engine/data/heroes.ts'

export interface GameSetup {
  readonly hero: HeroId
  readonly seed: number
}

export const defaultSetup: GameSetup = { hero: 'warrior', seed: 1 }

/** The largest seed the start screen suggests. Any whole number works as a seed. */
export const maxSuggestedSeed = 999_999

/**
 * Read the hero and seed from a query string. Returns null when the address names neither, which
 * means "show the start screen". Anything missing or invalid falls back to the defaults.
 */
export function readSetup(search: string): GameSetup | null {
  const params = new URLSearchParams(search)
  if (!params.has('hero') && !params.has('seed')) return null
  const hero = params.get('hero')
  const seed = parseSeed(params.get('seed') ?? '')
  return {
    hero: hero === 'warrior' || hero === 'mage' ? hero : defaultSetup.hero,
    seed: seed ?? defaultSetup.seed,
  }
}

/** A seed typed by the player, or null if it is not a whole number. */
export function parseSeed(text: string): number | null {
  const trimmed = text.trim()
  if (trimmed === '') return null
  const seed = Number(trimmed)
  return Number.isSafeInteger(seed) ? seed : null
}

/** A seed for a new game, from 1 to maxSuggestedSeed. `random` returns a number in [0, 1). */
export function randomSeed(random: () => number = Math.random): number {
  return Math.floor(random() * maxSuggestedSeed) + 1
}

/** The query string that names a game: "?hero=mage&seed=7". */
export function setupQuery(setup: GameSetup): string {
  return `?hero=${setup.hero}&seed=${setup.seed}`
}
