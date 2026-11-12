import { describe, expect, it } from 'vitest'
import { scenario1, spaceLabel } from './data/scenario1.ts'
import {
  createBoard,
  manhattan,
  neighbours,
  pathTo,
  posKey,
  shortestPaths,
  terrainAt,
} from './grid.ts'

const board = createBoard(scenario1)
const at = (row: number, col: number) => ({ row, col })
const walkable = (pos: { row: number; col: number }) => {
  const terrain = terrainAt(board, pos)
  return terrain === 'floor' || terrain === 'mud' || terrain === 'door'
}

describe('Scenario 1 map', () => {
  it('puts the terrain where the spec says', () => {
    expect(terrainAt(board, at(3, 1))).toBe('floor') // A R3C1, the start
    expect(terrainAt(board, at(2, 4))).toBe('mud') // A R2C4
    expect(terrainAt(board, at(3, 5))).toBe('rubble') // A R3C5
    expect(terrainAt(board, at(3, 7))).toBe('door')
    expect(terrainAt(board, at(3, 9))).toBe('lava') // B R3C2
    expect(terrainAt(board, at(4, 10))).toBe('lava') // B R4C3
    expect(terrainAt(board, at(5, 11))).toBe('mud') // B R5C4
    expect(terrainAt(board, at(6, 12))).toBe('chest') // B R6C5
  })

  it('has no spaces off the two tiles', () => {
    expect(terrainAt(board, at(1, 3))).toBeUndefined() // above Tile A
    expect(terrainAt(board, at(5, 3))).toBeUndefined() // below Tile A
    expect(terrainAt(board, at(3, 13))).toBeUndefined() // right of Tile B
  })

  it('labels spaces the way the spec does', () => {
    expect(spaceLabel(at(3, 1))).toBe('A R3C1')
    expect(spaceLabel(at(3, 7))).toBe('Door')
    expect(spaceLabel(at(6, 12))).toBe('B R6C5')
  })
})

describe('distance', () => {
  it('counts rows plus columns, with no diagonals', () => {
    expect(manhattan(at(1, 1), at(3, 4))).toBe(5)
  })

  it('lists neighbours up, down, left, right', () => {
    expect(neighbours(at(3, 3))).toEqual([at(2, 3), at(4, 3), at(3, 2), at(3, 4)])
  })
})

describe('shortestPaths', () => {
  it('charges 2 to enter Mud', () => {
    const paths = shortestPaths(board, at(3, 3), walkable, false, 2)
    expect(paths.cost.get(posKey(at(3, 4)))).toBe(1)
    expect(paths.cost.get(posKey(at(2, 4)))).toBe(3) // up (1) then into Mud (2)
  })

  it('goes around Rubble', () => {
    const paths = shortestPaths(board, at(3, 4), walkable, false, 2)
    // Rubble at A R3C5 and A R2C5 forces the route through A R4C5.
    expect(pathTo(paths, at(3, 4), at(3, 6))).toEqual([
      at(3, 4),
      at(4, 4),
      at(4, 5),
      at(4, 6),
      at(3, 6),
    ])
  })

  it('can step onto a closed door but not through it', () => {
    const closed = shortestPaths(board, at(3, 6), walkable, false, 2)
    expect(closed.cost.get(posKey(at(3, 7)))).toBe(1)
    expect(closed.cost.has(posKey(at(3, 8)))).toBe(false)
    const open = shortestPaths(board, at(3, 6), walkable, true, 2)
    expect(open.cost.get(posKey(at(3, 8)))).toBe(2)
  })

  it('breaks ties toward the lowest row, then column', () => {
    // From (3,3) to (2,2) the routes via (2,3) and via (3,2) cost the same; (2,3) has the lower row.
    const paths = shortestPaths(board, at(3, 3), walkable, false, 2)
    expect(pathTo(paths, at(3, 3), at(2, 2))).toEqual([at(3, 3), at(2, 3), at(2, 2)])
  })

  it('returns an empty path for an unreachable space', () => {
    const paths = shortestPaths(board, at(3, 3), walkable, false, 2)
    expect(pathTo(paths, at(3, 3), at(3, 10))).toEqual([])
  })
})
