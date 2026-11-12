// Display names and lookups for things the screen shows by name.

import type { CardDefinition } from '../engine/data/cardTypes.ts'
import type { EnemyCardDefinition } from '../engine/data/enemyDeck.ts'
import type { HeroId } from '../engine/data/heroes.ts'
import { monsterStats } from '../engine/data/monsters.ts'
import type { GameContext } from '../engine/gameState.ts'
import type { Pos } from '../engine/grid.ts'

export const heroNames: Record<HeroId, string> = {
  warrior: 'Warrior',
  mage: 'Mage',
}

export function cardById(context: GameContext, id: string): CardDefinition {
  const card = context.cardsById.get(id)
  if (!card) throw new Error(`Unknown card ${id}`)
  return card
}

export function enemyCardById(context: GameContext, id: string): EnemyCardDefinition {
  const card = context.enemyCards.find((c) => c.id === id)
  if (!card) throw new Error(`Unknown enemy card ${id}`)
  return card
}

/** "Goblin G2" when the scenario has several of that kind, "the Ogre" when it has one. */
export function monsterName(context: GameContext, id: string): string {
  const monster = context.scenario.monsters.find((m) => m.id === id)
  if (!monster) return id
  const name = monsterStats[monster.kind].name
  const sameKind = context.scenario.monsters.filter((m) => m.kind === monster.kind).length
  return sameKind > 1 ? `${name} ${id}` : `the ${name}`
}

/** A space as the map's highlighted buttons name it. */
export const spaceName = (pos: Pos): string => `row ${pos.row}, column ${pos.col}`
