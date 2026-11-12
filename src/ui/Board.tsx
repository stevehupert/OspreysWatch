// The map: one square per space, with the hero and the monsters you can see.

import type { Terrain } from '../engine/data/scenarioTypes.ts'
import type { GameContext, GameState, MonsterState } from '../engine/gameState.ts'
import { samePos, terrainAt, type Pos } from '../engine/grid.ts'
import { heroNames } from './names.ts'

interface BoardProps {
  readonly context: GameContext
  readonly state: GameState
}

const terrainNames: Record<Terrain, string> = {
  floor: '',
  mud: 'Mud',
  lava: 'Lava',
  rubble: 'Rubble',
  chest: 'Chest',
  door: 'Door',
}

export function Board({ context, state }: BoardProps) {
  const rows = context.scenario.spaces.map((space) => space.at.row)
  const cols = context.scenario.spaces.map((space) => space.at.col)
  const firstRow = Math.min(...rows)
  const firstCol = Math.min(...cols)
  const width = Math.max(...cols) - firstCol + 1

  const cells = []
  for (let row = firstRow; row <= Math.max(...rows); row++) {
    for (let col = firstCol; col < firstCol + width; col++) {
      cells.push(<Cell key={`${row}-${col}`} context={context} state={state} pos={{ row, col }} />)
    }
  }

  return (
    <div
      className="board"
      aria-label="Map"
      style={{ gridTemplateColumns: `repeat(${width}, var(--cell-size))` }}
    >
      {cells}
    </div>
  )
}

function Cell({ context, state, pos }: BoardProps & { readonly pos: Pos }) {
  const terrain = terrainAt(context.board, pos)
  if (!terrain) return <div className="cell off-map" />

  // Dead monsters leave the map; hidden ones (the Ogre behind the door) are not shown until revealed.
  const monster = state.monsters.find((m) => m.health > 0 && m.revealed && samePos(m.pos, pos))
  const hero = samePos(state.position, pos)
  const label = terrainLabel(terrain, state)

  return (
    <div className={`cell terrain-${terrain}`} title={label || undefined}>
      {label && <span className="terrain-label">{label}</span>}
      {hero && (
        <span className={`token hero hero-${state.heroId}`} title={heroNames[state.heroId]}>
          {heroNames[state.heroId][0]}
        </span>
      )}
      {monster && <MonsterToken monster={monster} />}
    </div>
  )
}

function terrainLabel(terrain: Terrain, state: GameState): string {
  if (terrain === 'door') return state.doorOpen ? 'Door (open)' : 'Door'
  if (terrain === 'chest') return state.looted ? 'Chest (looted)' : 'Chest'
  return terrainNames[terrain]
}

function MonsterToken({ monster }: { readonly monster: MonsterState }) {
  return (
    <span className={`token monster monster-${monster.kind}`} title={monster.id}>
      {monster.id}
      <span className="token-health">{monster.health}</span>
    </span>
  )
}
