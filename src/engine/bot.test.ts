import { describe, expect, it } from 'vitest'
import { chooseAction, chooseRoarDiscard, evaluate } from './bot.ts'
import { candidateActions, moveDestinations } from './botCandidates.ts'
import { createContext, createGame, type GameState } from './gameState.ts'
import { playAction } from './round.ts'
import { playBotGame, summarise, type GameSummary } from './simulate.ts'

const context = createContext()
const at = (row: number, col: number) => ({ row, col })

describe('candidate plays', () => {
  it('only offers rests when the hand is empty, and only with 2+ discards', () => {
    const state = createGame(context, 'warrior', 3)
    const empty: GameState = {
      ...state,
      deck: { ...state.deck, hand: [], discard: ['warrior-cleave', 'warrior-sweep'] },
    }
    expect(candidateActions(context, empty)).toEqual([
      { type: 'rest', lose: 'warrior-cleave' },
      { type: 'rest', lose: 'warrior-sweep' },
    ])
    expect(
      candidateActions(context, { ...empty, deck: { ...empty.deck, discard: ['warrior-cleave'] } }),
    ).toEqual([])
  })

  it('offers plays for each card in hand, and rests last', () => {
    const state = createGame(context, 'warrior', 3)
    const withDiscard = { ...state, deck: { ...state.deck, discard: ['a', 'b'] } }
    const actions = candidateActions(context, withDiscard)
    expect(actions.some((a) => a.type === 'play')).toBe(true)
    expect(actions.slice(-2).every((a) => a.type === 'rest')).toBe(true)
  })

  it('suggests staying put and a few promising destinations, in row-then-column order', () => {
    const state = createGame(context, 'warrior', 3)
    const spots = moveDestinations(context, state, 3)
    expect(spots).toContainEqual(state.position)
    const keys = spots.map((p) => p.row * 16 + p.col)
    expect(keys).toEqual([...keys].sort((a, b) => a - b))
  })
})

describe('scoring', () => {
  it('puts a win above everything and a loss below everything', () => {
    const state = createGame(context, 'mage', 1)
    const won = evaluate(context, { ...state, result: 'victory', phase: 'over' })
    const lost = evaluate(context, { ...state, result: 'defeat-health', phase: 'over' })
    expect(won).toBeGreaterThan(evaluate(context, state))
    expect(lost).toBeLessThan(evaluate(context, state))
  })

  it('prefers more health, fewer monster hit points and an open door', () => {
    const state = createGame(context, 'warrior', 1)
    const base = evaluate(context, state)
    expect(evaluate(context, { ...state, health: state.health - 1 })).toBeLessThan(base)
    expect(
      evaluate(context, {
        ...state,
        monsters: state.monsters.map((m) => (m.id === 'G1' ? { ...m, health: 1 } : m)),
      }),
    ).toBeGreaterThan(base)
  })
})

describe('Frightening Roar', () => {
  it('throws away the least valuable card in hand', () => {
    const state = createGame(context, 'warrior', 1)
    const near: GameState = {
      ...state,
      position: at(4, 9),
      doorOpen: true,
      deck: {
        ...state.deck,
        hand: ['warrior-heavy-blow', 'warrior-second-wind', 'warrior-charge'],
      },
      monsters: state.monsters.map((m) =>
        m.id === 'O' ? { ...m, revealed: true, pos: at(4, 11) } : m,
      ),
    }
    expect(chooseRoarDiscard(context, near)).toBe('warrior-second-wind')
    expect(chooseRoarDiscard(context, { ...near, position: at(4, 8) })).toBeUndefined()
  })
})

describe('the bot', () => {
  it('chooses an action the game accepts', () => {
    for (const hero of ['warrior', 'mage'] as const) {
      const state = createGame(context, hero, 5)
      const action = chooseAction(context, state)
      expect(action).toBeDefined()
      expect(playAction(context, state, action!).ok).toBe(true)
    }
  })

  it('plays a whole game to the end, the same way every time for a seed', () => {
    for (const hero of ['warrior', 'mage'] as const) {
      const first = playBotGame(context, hero, 11)
      expect(first.outcome).not.toBe('timeout')
      expect(playBotGame(context, hero, 11)).toEqual(first)
    }
  })

  it('wins a fair share of 20 games with each hero (a loose check, not a balance target)', () => {
    for (const hero of ['warrior', 'mage'] as const) {
      const results = Array.from({ length: 20 }, (_, i) => playBotGame(context, hero, 2000 + i))
      const wins = results.filter((r) => r.outcome === 'victory').length
      expect(wins).toBeGreaterThanOrEqual(2)
      expect(wins).toBeLessThanOrEqual(19)
    }
  }, 30_000)

  it('also plays the Interact-door variant to the end', () => {
    const interact = createContext({ rules: { doorOpensBy: 'interact' } })
    for (const hero of ['warrior', 'mage'] as const) {
      expect(playBotGame(interact, hero, 21).outcome).not.toBe('timeout')
    }
  })
})

describe('summarise', () => {
  const game = (outcome: GameSummary['outcome'], rounds: number): GameSummary => ({
    hero: 'mage',
    seed: 1,
    outcome,
    rounds,
    health: 1,
    lowestHealth: 1,
    rests: 0,
    cardsLost: 0,
  })

  it('counts outcomes and win rate', () => {
    const summary = summarise([
      game('victory', 10),
      game('victory', 14),
      game('defeat-health', 5),
      game('defeat-exhausted', 9),
    ])
    expect(summary.outcomes).toEqual({
      victory: 2,
      'defeat-health': 1,
      'defeat-exhausted': 1,
      timeout: 0,
    })
    expect(summary.winRate).toBe(0.5)
    expect(summary.averageWinRounds).toBe(12)
    expect(summary.winRateMargin).toBeGreaterThan(0)
  })

  it('copes with no games', () => {
    expect(summarise([]).winRate).toBe(0)
  })
})
