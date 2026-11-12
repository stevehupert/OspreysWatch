// Display names and lookups for things the screen shows by name.

import type { CardDefinition } from '../engine/data/cardTypes.ts'
import type { HeroId } from '../engine/data/heroes.ts'
import type { GameContext } from '../engine/gameState.ts'

export const heroNames: Record<HeroId, string> = {
  warrior: 'Warrior',
  mage: 'Mage',
}

export function cardById(context: GameContext, id: string): CardDefinition {
  const card = context.cardsById.get(id)
  if (!card) throw new Error(`Unknown card ${id}`)
  return card
}
