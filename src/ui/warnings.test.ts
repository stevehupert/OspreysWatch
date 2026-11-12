import { describe, expect, it } from 'vitest'
import type { HeroId } from '../engine/data/heroes.ts'
import {
  createContext,
  createGame,
  type GameState,
  type MonsterState,
} from '../engine/gameState.ts'
import type { PlayAction } from './selection.ts'
import { warningsFor } from './warnings.ts'

const context = createContext()
const at = (row: number, col: number) => ({ row, col })

function setUp(
  hero: HeroId,
  hand: string[],
  monsters: Record<string, Partial<MonsterState>> = {},
  discard: string[] = [],
): GameState {
  const start = createGame(context, hero, 1)
  return {
    ...start,
    deck: { ...start.deck, hand, discard },
    monsters: start.monsters.map((m) => ({ ...m, ...monsters[m.id] })),
  }
}

const play = (card: string, use: PlayAction['use'], choices: Partial<PlayAction> = {}) =>
  ({ type: 'play', card, use, ...choices }) as PlayAction

describe('warningsFor', () => {
  it('warns that an attack with no target does nothing, and that a burn card is lost anyway', () => {
    const state = setUp('warrior', ['warrior-heavy-blow'])
    expect(warningsFor(context, state, play('warrior-heavy-blow', 'A'))).toEqual([
      'No enemy is hurt or moved.',
      'Heavy Blow burns: it is lost for the rest of the scenario.',
    ])
  })

  it('has nothing to say about an attack that hits', () => {
    const state = setUp('warrior', ['warrior-quick-strike'], { G1: { pos: at(3, 2) } })
    expect(
      warningsFor(context, state, play('warrior-quick-strike', 'A', { target: 'G1' })),
    ).toEqual([])
  })

  it("notices when armor stops all the damage (Attack 1 against the Ogre's Armor 1)", () => {
    const state = setUp('warrior', ['warrior-sweep'], {
      O: { pos: at(3, 2), revealed: true, revealedOnRound: null },
    })
    expect(warningsFor(context, state, play('warrior-sweep', 'attack', { target: 'O' }))).toEqual([
      'No enemy is hurt or moved.',
    ])
  })

  it('warns about a Move that stays put', () => {
    const state = setUp('warrior', ['warrior-sweep'])
    expect(warningsFor(context, state, play('warrior-sweep', 'B'))).toEqual([
      'You stay where you are.',
    ])
    expect(warningsFor(context, state, play('warrior-sweep', 'B', { to: at(3, 2) }))).toEqual([])
  })

  it('warns when Arcane Recall takes back fewer cards than it could', () => {
    const discard = ['mage-spark', 'mage-ward']
    const state = setUp('mage', ['mage-arcane-recall'], {}, discard)
    expect(
      warningsFor(context, state, play('mage-arcane-recall', 'A', { returns: ['mage-spark'] })),
    ).toEqual([
      'You take back 1 of up to 2 cards.',
      'Arcane Recall burns: it is lost for the rest of the scenario.',
    ])
    expect(
      warningsFor(context, state, play('mage-arcane-recall', 'A', { returns: discard })),
    ).toEqual([])
  })

  it('has nothing to say about plays that cannot waste anything', () => {
    const state = setUp('warrior', ['warrior-shield-bash', 'warrior-second-wind'])
    expect(warningsFor(context, state, play('warrior-shield-bash', 'B'))).toEqual([])
    expect(warningsFor(context, state, play('warrior-second-wind', 'A'))).toEqual([])
  })
})
