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
}
