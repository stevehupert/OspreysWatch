// The map: one square per space, with the hero and the monsters you can see.

import type { Terrain } from '../engine/data/scenarioTypes.ts'
import type { GameContext, GameState, MonsterState } from '../engine/gameState.ts'
import { samePos, terrainAt, type Pos } from '../engine/grid.ts'
import { heroNames } from './names.ts'

interface BoardProps {
  readonly context: GameContext
  readonly state: GameState
  /** Spaces the player may click right now (a Move destination). */
  readonly selectableSpaces?: readonly Pos[]
  /** Monsters the player may click right now (a target), by id. */
  readonly selectableMonsters?: readonly string[]
  /** The space already chosen for the play being built (for example where Charge will move). */
  readonly chosenSpace?: Pos
  readonly onSpaceClick?: (pos: Pos) => void
  readonly onMonsterClick?: (id: string) => void
}

const terrainNames: Record<Terrain, string> = {
  floor: '',
  mud: 'Mud',
  lava: 'Lava',
  rubble: 'Rubble',
  chest: 'Chest',
  door: 'Door',
}

export function Board(props: BoardProps) {
  const { context } = props
  const rows = context.scenario.spaces.map((space) => space.at.row)
  const cols = context.scenario.spaces.map((space) => space.at.col)
  const firstRow = Math.min(...rows)
  const firstCol = Math.min(...cols)
  const width = Math.max(...cols) - firstCol + 1

  const cells = []
  for (let row = firstRow; row <= Math.max(...rows); row++) {
    for (let col = firstCol; col < firstCol + width; col++) {
      cells.push(<Cell key={`${row}-${col}`} {...props} pos={{ row, col }} />)
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

function Cell(props: BoardProps & { readonly pos: Pos }) {
  const { context, state, pos } = props
  const terrain = terrainAt(context.board, pos)
  if (!terrain) return <div className="cell off-map" />

  // Dead monsters leave the map; hidden ones (the Ogre behind the door) are not shown until revealed.
  const monster = state.monsters.find((m) => m.health > 0 && m.revealed && samePos(m.pos, pos))
  const hero = samePos(state.position, pos)
  const label = terrainLabel(terrain, state)

  const contents = (
    <>
      {label && <span className="terrain-label">{label}</span>}
      {hero && (
        <span className={`token hero hero-${state.heroId}`} title={heroNames[state.heroId]}>
          {heroNames[state.heroId][0]}
        </span>
      )}
      {monster && <MonsterToken monster={monster} />}
    </>
  )

  const chosen = props.chosenSpace !== undefined && samePos(props.chosenSpace, pos)
  const className = `cell terrain-${terrain}${chosen ? ' chosen' : ''}`
  if (monster && props.selectableMonsters?.includes(monster.id)) {
    return (
      <button
        type="button"
        className={`${className} selectable`}
        aria-label={`Target ${monster.id}`}
        onClick={() => props.onMonsterClick?.(monster.id)}
      >
        {contents}
      </button>
    )
  }
  if (props.selectableSpaces?.some((p) => samePos(p, pos))) {
    return (
      <button
        type="button"
        className={`${className} selectable`}
        aria-label={`Move to row ${pos.row}, column ${pos.col}`}
        onClick={() => props.onSpaceClick?.(pos)}
      >
        {contents}
      </button>
    )
  }
  return (
    <div
      className={className}
      title={chosen ? 'You move here' : label || undefined}
      aria-label={chosen ? 'You move here' : undefined}
    >
      {contents}
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
