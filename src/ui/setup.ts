// Which game to show, read from the page address: ?hero=mage&seed=7.
// Until there is a start screen, this is how to look at a particular hero or deal.

import type { HeroId } from '../engine/data/heroes.ts'

export interface GameSetup {
  readonly hero: HeroId
  readonly seed: number
}

export const defaultSetup: GameSetup = { hero: 'warrior', seed: 1 }

/** Read the hero and seed from a query string, falling back to the defaults for anything missing or invalid. */
export function readSetup(search: string): GameSetup {
  const params = new URLSearchParams(search)
  const hero = params.get('hero')
  const seed = Number(params.get('seed'))
  return {
    hero: hero === 'warrior' || hero === 'mage' ? hero : defaultSetup.hero,
    seed: params.has('seed') && Number.isInteger(seed) ? seed : defaultSetup.seed,
  }
}
