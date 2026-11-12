// The board: terrain lookups, distances and shortest paths (rules-spec sections 6 and 9).
// Pure functions of the scenario data. Nothing here knows about heroes, cards or monsters.

import type { Pos, ScenarioDefinition, Terrain } from './data/scenarioTypes.ts'

export type { Pos, Terrain }

/** Spaces are keyed by row * 16 + column so they can sit in a Map or Set. Columns never reach 16. */
export type PosKey = number

export const posKey = (pos: Pos): PosKey => pos.row * 16 + pos.col
export const posFromKey = (key: PosKey): Pos => ({ row: key >> 4, col: key & 15 })
export const samePos = (a: Pos, b: Pos): boolean => a.row === b.row && a.col === b.col

/** Range and adjacency count spaces along rows and columns only; no diagonals, no line of sight. */
export const manhattan = (a: Pos, b: Pos): number =>
  Math.abs(a.row - b.row) + Math.abs(a.col - b.col)

/** The four orthogonal neighbours, in a fixed order (up, down, left, right) so path ties are repeatable. */
export function neighbours(pos: Pos): Pos[] {
  return [
    { row: pos.row - 1, col: pos.col },
    { row: pos.row + 1, col: pos.col },
    { row: pos.row, col: pos.col - 1 },
    { row: pos.row, col: pos.col + 1 },
  ]
}

export interface Board {
  readonly terrain: ReadonlyMap<PosKey, Terrain>
}

export function createBoard(scenario: ScenarioDefinition): Board {
  return { terrain: new Map(scenario.spaces.map((space) => [posKey(space.at), space.terrain])) }
}

/** The terrain at a space, or undefined if the space is off the map. */
export const terrainAt = (board: Board, pos: Pos): Terrain | undefined =>
  board.terrain.get(posKey(pos))

export interface PathMap {
  /** Cheapest movement cost from the start to each reachable space (the start itself costs 0). */
  readonly cost: ReadonlyMap<PosKey, number>
  /** The previous space on the cheapest path to each space. */
  readonly previous: ReadonlyMap<PosKey, PosKey>
}

/**
 * Cheapest paths from `start`. A space costs 1 to enter, or `mudCost` for Mud.
 * `canEnter` says which spaces the mover may step into (it decides about creatures and Lava).
 * A closed door can be entered if `canEnter` allows it, but the path cannot continue through it.
 * Ties between equally cheap routes go to the lowest row, then the lowest column.
 */
export function shortestPaths(
  board: Board,
  start: Pos,
  canEnter: (pos: Pos) => boolean,
  doorOpen: boolean,
  mudCost: number,
): PathMap {
  const startKey = posKey(start)
  const cost = new Map<PosKey, number>([[startKey, 0]])
  const previous = new Map<PosKey, PosKey>()
  const settled = new Set<PosKey>()
  const frontier: PosKey[] = [startKey]

  while (frontier.length > 0) {
    let best = 0
    for (let i = 1; i < frontier.length; i++) {
      const a = frontier[i]
      const b = frontier[best]
      const costA = cost.get(a) ?? Infinity
      const costB = cost.get(b) ?? Infinity
      if (costA < costB || (costA === costB && a < b)) best = i
    }
    const currentKey = frontier.splice(best, 1)[0]
    settled.add(currentKey)
    const current = posFromKey(currentKey)
    if (!doorOpen && currentKey !== startKey && terrainAt(board, current) === 'door') continue

    for (const next of neighbours(current)) {
      if (!canEnter(next)) continue
      const nextKey = posKey(next)
      if (settled.has(nextKey)) continue
      const newCost = (cost.get(currentKey) ?? 0) + (terrainAt(board, next) === 'mud' ? mudCost : 1)
      const oldCost = cost.get(nextKey)
      if (oldCost === undefined || newCost < oldCost) {
        if (oldCost === undefined) frontier.push(nextKey)
        cost.set(nextKey, newCost)
        previous.set(nextKey, currentKey)
      }
    }
  }
  return { cost, previous }
}

/** The spaces on the cheapest path to `target`, start first. Empty if the target is unreachable. */
export function pathTo(paths: PathMap, start: Pos, target: Pos): Pos[] {
  const startKey = posKey(start)
  let key = posKey(target)
  if (!paths.cost.has(key)) return []
  const keys = [key]
  while (key !== startKey) {
    key = paths.previous.get(key) as number
    keys.push(key)
  }
  return keys.reverse().map(posFromKey)
}
