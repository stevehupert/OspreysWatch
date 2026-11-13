// Shapes for scenario map data. The numbers and placements themselves live in scenarioN.ts files.

import type { MonsterKind } from './monsters.ts'

/** A space on the global grid. Rows count down the page from 1; columns count across from 1. */
export interface Pos {
  readonly row: number
  readonly col: number
}

export type Terrain = 'floor' | 'mud' | 'lava' | 'rubble' | 'chest' | 'door'

export interface ScenarioSpace {
  readonly at: Pos
  readonly terrain: Terrain
}

export interface ScenarioMonster {
  readonly id: string
  readonly kind: MonsterKind
  readonly at: Pos
  /** Hidden monsters cannot be targeted or acting until the door opens. */
  readonly hidden: boolean
}

export interface ScenarioDefinition {
  readonly id: string
  readonly name: string
  /** Every space a creature can stand on or bump into. Anything not listed is off the map. */
  readonly spaces: readonly ScenarioSpace[]
  readonly heroStart: Pos
  readonly door: Pos
  readonly chest: Pos
  readonly monsters: readonly ScenarioMonster[]
  /** Story text for the start and end screens. */
  readonly story: ScenarioStory
  /** What the end screen reports as earned. */
  readonly rewards: ScenarioRewards
}

export interface ScenarioStory {
  /** Shown on the start screen. */
  readonly intro: string
  readonly victory: string
  readonly defeat: string
}

/** Not used by the rules yet: there is no campaign in the MVP, so the end screen only reports these. */
export interface ScenarioRewards {
  readonly victoryXp: number
  /** Gold recorded as the chest's loot, earned only on a victory. */
  readonly chestGold: number
}
