import { describe, expect, it } from 'vitest'
import { createContext, createGame } from '../engine/gameState.ts'
import { legalActions } from '../engine/legalActions.ts'
import { isMapField, matchingPlays, nextField, options, playableCards } from './selection.ts'

const context = createContext()
const at = (row: number, col: number) => ({ row, col })

describe('narrowing a play one choice at a time', () => {
  // Warrior at the start space A R3C1 holding only Charge (Move 3, then Attack 2).
  const start = createGame(context, 'warrior', 1)
  const state = { ...start, deck: { ...start.deck, hand: ['warrior-charge'] } }
  const actions = legalActions(context, state)

  it('asks how to use the card first', () => {
    const plays = matchingPlays(actions, 'warrior-charge', [])
    expect(nextField(plays)).toBe('use')
    expect(options(plays, 'use')).toEqual(['A', 'B', 'move', 'attack'])
  })

  it('then where to move, with staying put offered first', () => {
    const plays = matchingPlays(actions, 'warrior-charge', [{ field: 'use', value: 'A' }])
    expect(nextField(plays)).toBe('to')
    expect(options(plays, 'to')[0]).toBeUndefined()
    expect(options(plays, 'to')).toContainEqual(at(3, 4))
  })

  it('then whom to hit from the new space, and stops when one play is left', () => {
    const picks = [
      { field: 'use' as const, value: 'A' },
      { field: 'to' as const, value: at(3, 4) },
    ]
    const plays = matchingPlays(actions, 'warrior-charge', picks)
    expect(nextField(plays)).toBe('target')
    expect(options(plays, 'target')).toEqual([undefined, 'G1', 'G2'])

    const done = matchingPlays(actions, 'warrior-charge', [
      ...picks,
      { field: 'target', value: 'G2' },
    ])
    expect(done).toEqual([
      { type: 'play', card: 'warrior-charge', use: 'A', to: at(3, 4), target: 'G2' },
    ])
    expect(nextField(done)).toBeNull()
  })

  it('treats "no target" as a choice of its own', () => {
    const plays = matchingPlays(actions, 'warrior-charge', [
      { field: 'use', value: 'A' },
      { field: 'to', value: at(3, 4) },
      { field: 'target', value: undefined },
    ])
    expect(plays).toEqual([{ type: 'play', card: 'warrior-charge', use: 'A', to: at(3, 4) }])
  })

  it('knows which cards can be played and which choices are made on the map', () => {
    expect(playableCards(actions)).toEqual(new Set(['warrior-charge']))
    expect(
      ['use', 'to', 'target', 'second', 'axis', 'returns'].filter((f) => isMapField(f as never)),
    ).toEqual(['to', 'target', 'second'])
  })
})
