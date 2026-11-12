import { describe, expect, it } from 'vitest'
import { chooseAction, chooseRoarDiscard, defaultBotWeights } from './bot.ts'
import { candidateActions } from './botCandidates.ts'
import type { HeroId } from './data/heroes.ts'
import { createContext, createGame, type GameState, type MonsterState } from './gameState.ts'
import { performAction, type HeroAction } from './heroActions.ts'
import { actionKey, legalActions } from './legalActions.ts'
import { playAction } from './round.ts'

const context = createContext()
const at = (row: number, col: number) => ({ row, col })

function setUp(
  hero: HeroId,
  patch: Partial<GameState> & { hand?: string[]; discard?: string[] },
  monsters: Record<string, Partial<MonsterState>> = {},
): GameState {
  const start = createGame(context, hero, 1)
  const { hand, discard, ...rest } = patch
  return {
    ...start,
    ...rest,
    deck: {
      ...start.deck,
      hand: hand ?? start.deck.hand,
      discard: discard ?? start.deck.discard,
    },
    monsters: start.monsters.map((m) => ({ ...m, ...monsters[m.id] })),
  }
}

const plays = (actions: HeroAction[], card: string, use: string) =>
  actions.filter((a) => a.type === 'play' && a.card === card && a.use === use) as Extract<
    HeroAction,
    { type: 'play' }
  >[]

describe('legalActions', () => {
  it('offers nothing once the game is over', () => {
    expect(legalActions(context, setUp('warrior', { phase: 'over', result: 'victory' }))).toEqual(
      [],
    )
  })

  it('during Frightening Roar, offers only discarding each card in hand', () => {
    const state = setUp('warrior', {
      phase: 'roar',
      hand: ['warrior-sweep', 'warrior-cleave'],
    })
    expect(legalActions(context, state)).toEqual([
      { type: 'discard', card: 'warrior-cleave' },
      { type: 'discard', card: 'warrior-sweep' },
    ])
  })

  it('lists every space a Move can reach, plus staying put', () => {
    // From the start space A R3C1, Move 3 reaches 9 spaces; Mud at A R2C4 costs 2, so it is out of reach.
    const state = setUp('warrior', { hand: ['warrior-quick-strike'] })
    const moves = plays(legalActions(context, state), 'warrior-quick-strike', 'B')
    expect(moves.map((a) => a.to)).toEqual([
      undefined,
      at(2, 1),
      at(2, 2),
      at(2, 3),
      at(3, 2),
      at(3, 3),
      at(3, 4),
      at(4, 1),
      at(4, 2),
      at(4, 3),
    ])
  })

  it('allows an attack with no enemy in range, which does nothing (open question 17)', () => {
    const state = setUp('warrior', { hand: ['warrior-quick-strike'] })
    const actions = legalActions(context, state)
    expect(plays(actions, 'warrior-quick-strike', 'A')).toEqual([
      { type: 'play', card: 'warrior-quick-strike', use: 'A' },
    ])
    expect(plays(actions, 'warrior-quick-strike', 'attack')).toEqual([
      { type: 'play', card: 'warrior-quick-strike', use: 'attack' },
    ])
  })

  it('offers no Loot away from the chest, and no Interact while the door opens by stepping on it', () => {
    const state = setUp('warrior', { hand: ['warrior-quick-strike'] })
    const uses = legalActions(context, state).map((a) => (a.type === 'play' ? a.use : a.type))
    expect(uses).not.toContain('loot')
    expect(uses).not.toContain('interact')
  })

  it('lets Charge attack from the space it moves to', () => {
    // From A R3C1, Charge's Move 3 reaches spaces next to G1 (A R2C4) and G2 (A R4C4), but not G3 (A R2C6).
    const state = setUp('warrior', { hand: ['warrior-charge'] })
    const charges = plays(legalActions(context, state), 'warrior-charge', 'A')
    const hitsOn = (id: string) => charges.filter((a) => a.target === id).map((a) => a.to)
    expect(hitsOn('G1')).toEqual([at(2, 3), at(3, 4)])
    expect(hitsOn('G2')).toEqual([at(3, 4), at(4, 3)])
    expect(hitsOn('G3')).toEqual([])
  })

  it('names a push axis only on a diagonal tie, and drops pushes that make the attack miss', () => {
    // The Mage at A R3C1 and G1 at A R2C2 are a diagonal tie. Pushed up, G1 hits the map edge and
    // stays in range; pushed right, it ends 4 away, so Force Push's Attack 1 is out of range (open question 14).
    const state = setUp('mage', { hand: ['mage-force-push'] }, { G1: { pos: at(2, 2) } })
    const pushes = plays(legalActions(context, state), 'mage-force-push', 'A')
    expect(pushes.filter((a) => a.target === 'G1')).toEqual([
      { type: 'play', card: 'mage-force-push', use: 'A', target: 'G1', axis: 'row' },
    ])
  })

  it('leaves the axis out of a straight push', () => {
    const state = setUp('warrior', { hand: ['warrior-shield-bash'] }, { G1: { pos: at(3, 2) } })
    expect(plays(legalActions(context, state), 'warrior-shield-bash', 'A')).toEqual([
      { type: 'play', card: 'warrior-shield-bash', use: 'A' },
      { type: 'play', card: 'warrior-shield-bash', use: 'A', target: 'G1' },
    ])
  })

  it("offers Cleave's second hit only on another adjacent enemy", () => {
    const state = setUp(
      'warrior',
      { hand: ['warrior-cleave'] },
      { G1: { pos: at(2, 1) }, G2: { pos: at(3, 2) } },
    )
    const cleaves = plays(legalActions(context, state), 'warrior-cleave', 'A')
    expect(cleaves.map((a) => [a.target, a.second])).toEqual([
      [undefined, undefined],
      ['G1', undefined],
      ['G1', 'G2'],
      ['G2', undefined],
      ['G2', 'G1'],
    ])
  })

  it('lets Arcane Recall take back up to 2 discarded cards', () => {
    const state = setUp('mage', {
      hand: ['mage-arcane-recall'],
      discard: ['mage-spark', 'mage-ward', 'mage-mend'],
    })
    const recalls = plays(legalActions(context, state), 'mage-arcane-recall', 'A')
    expect(recalls.map((a) => a.returns ?? [])).toEqual([
      [],
      ['mage-mend'],
      ['mage-mend', 'mage-spark'],
      ['mage-mend', 'mage-ward'],
      ['mage-spark'],
      ['mage-spark', 'mage-ward'],
      ['mage-ward'],
    ])
  })

  it('offers a rest losing each discarded card, but only once per round', () => {
    const discard = ['warrior-sweep', 'warrior-cleave']
    const rests = (state: GameState) =>
      legalActions(context, state).filter((a) => a.type === 'rest')
    expect(rests(setUp('warrior', { discard }))).toEqual([
      { type: 'rest', lose: 'warrior-cleave' },
      { type: 'rest', lose: 'warrior-sweep' },
    ])
    expect(rests(setUp('warrior', { discard, restsThisRound: 1 }))).toEqual([])
    expect(rests(setUp('warrior', { discard: ['warrior-sweep'] }))).toEqual([])
  })

  it('lists each action once', () => {
    const state = setUp('warrior', {}, { G1: { pos: at(3, 2) } })
    const keys = legalActions(context, state).map(actionKey)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('covers every play the bot considers, across whole bot games', () => {
    // Anything the bot may legally do must also be offered to the player, with the same result.
    const outcome = (state: GameState, action: HeroAction) => {
      const result = performAction(context, state, action)
      return result.ok ? JSON.stringify(result.state) : null
    }
    for (const hero of ['warrior', 'mage'] as const) {
      for (const seed of [1, 2, 3]) {
        let state = createGame(context, hero, seed)
        while (!state.result) {
          if (state.phase === 'play') {
            const offered = new Set(legalActions(context, state).map((a) => outcome(state, a)))
            for (const action of candidateActions(context, state)) {
              const result = outcome(state, action)
              if (result !== null) expect(offered.has(result), JSON.stringify(action)).toBe(true)
            }
          }
          const action =
            state.phase === 'roar'
              ? {
                  type: 'discard' as const,
                  card: chooseRoarDiscard(context, state) ?? state.deck.hand[0],
                }
              : chooseAction(context, state, defaultBotWeights)
          if (!action) break
          const next = playAction(context, state, action)
          if (!next.ok) throw new Error(next.reason)
          state = next.state
        }
      }
    }
  })
})
