// Scenario 1, "The Sunken Crypt" (docs/rules-spec.md section 9).
//
// The two map tiles sit side by side on one global grid. Tile A fills rows 2-4 and columns 1-6.
// The door is column 7, row 3. Tile B fills rows 1-6 and global columns 8-12, so a Tile B space in
// local column c is global column c + 7. The helpers below let this file be written the way the
// spec writes it ("A R3C1", "B R6C5").

import type { Pos, ScenarioDefinition, ScenarioSpace, Terrain } from './scenarioTypes.ts'

const TILE_B_COLUMN_OFFSET = 7

const tileA = (row: number, col: number): Pos => ({ row, col })
const tileB = (row: number, col: number): Pos => ({ row, col: col + TILE_B_COLUMN_OFFSET })

/** The spec's name for a space, for messages and tests: "A R3C1", "Door", "B R6C5". */
export function spaceLabel(pos: Pos): string {
  if (pos.col <= 6) return `A R${pos.row}C${pos.col}`
  if (pos.col === 7) return 'Door'
  return `B R${pos.row}C${pos.col - TILE_B_COLUMN_OFFSET}`
}

const door = tileA(3, 7)
const chest = tileB(6, 5)

const specialSpaces: readonly [Terrain, readonly Pos[]][] = [
  ['mud', [tileA(2, 4), tileA(4, 4), tileB(5, 4), tileB(5, 5), tileB(6, 4)]],
  ['rubble', [tileA(2, 5), tileA(3, 5)]],
  ['lava', [tileB(3, 2), tileB(3, 3), tileB(4, 3)]],
  ['door', [door]],
  ['chest', [chest]],
]

function buildSpaces(): ScenarioSpace[] {
  const spaces: ScenarioSpace[] = []
  for (let row = 2; row <= 4; row++) {
    for (let col = 1; col <= 6; col++) {
      spaces.push({ at: tileA(row, col), terrain: 'floor' })
    }
  }
  for (let row = 1; row <= 6; row++) {
    for (let col = 1; col <= 5; col++) {
      spaces.push({ at: tileB(row, col), terrain: 'floor' })
    }
  }
  spaces.push({ at: door, terrain: 'floor' })
  return spaces.map((space) => {
    const special = specialSpaces.find(([, positions]) =>
      positions.some((p) => p.row === space.at.row && p.col === space.at.col),
    )
    return special ? { at: space.at, terrain: special[0] } : space
  })
}

export const scenario1: ScenarioDefinition = {
  id: 'sunken-crypt',
  name: 'The Sunken Crypt',
  spaces: buildSpaces(),
  heroStart: tileA(3, 1),
  door,
  chest,
  monsters: [
    { id: 'G1', kind: 'goblin', at: tileA(2, 4), hidden: false },
    { id: 'G2', kind: 'goblin', at: tileA(4, 4), hidden: false },
    { id: 'G3', kind: 'goblin', at: tileA(2, 6), hidden: false },
    { id: 'O', kind: 'ogre', at: tileB(4, 4), hidden: true },
  ],
  // Draft story text. The spec (section 9) gives only the goal sentence that ends the intro.
  story: {
    intro:
      'Floodwater has seeped into the old crypt, and goblins have crept in after it. Something larger stirs in the ritual chamber beyond the door. Get in and out, defeat every monster, and take the loot.',
    victory:
      'The last monster falls and the crypt goes quiet. You pry open the chest, drink the potion you find inside, and climb back into the daylight with its treasure.',
    defeat:
      'The crypt is too much for you this time. You stagger back to the surface empty-handed, but wiser for the attempt.',
  },
  // Rules-spec section 10: victoryXp, defeatXp and chestGold.
  rewards: {
    victoryXp: 2,
    defeatXp: 1,
    chestGold: 10,
  },
}
