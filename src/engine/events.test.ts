import { describe, expect, it } from 'vitest'
import { chooseAction, chooseRoarDiscard, defaultBotWeights } from './bot.ts'
import type { HeroId } from './data/heroes.ts'
import type { GameEvent } from './events.ts'
import { createContext, createGame, type GameState, type MonsterState } from './gameState.ts'
import { performAction, type HeroAction } from './heroActions.ts'
import { runMonsterPhase } from './monsterPhase.ts'
import { playAction } from './round.ts'

const context = createContext()
const at = (row: number, col: number) => ({ row, col })

function setUp(
  hero: HeroId,
  patch: Partial<GameState> & { hand?: string[]; discard?: string[]; enemyDraw?: string[] } = {},
  monsters: Record<string, Partial<MonsterState>> = {},
): GameState {
  const start = createGame(context, hero, 1)
  const { hand, discard, enemyDraw, ...rest } = patch
  return {
    ...start,
    ...rest,
    deck: { ...start.deck, hand: hand ?? start.deck.hand, discard: discard ?? [] },
    enemyDeck: enemyDraw ? { drawPile: enemyDraw, discard: [] } : start.enemyDeck,
    monsters: start.monsters.map((m) => ({ ...m, ...monsters[m.id] })),
  }
}

/** Run `fn` with a log and return what it reported. */
function record(fn: (log: (event: GameEvent) => void) => void): GameEvent[] {
  const events: GameEvent[] = []
  fn((event) => events.push(event))
  return events
}

function play(state: GameState, action: HeroAction): { state: GameState; events: GameEvent[] } {
  const events: GameEvent[] = []
  const result = playAction(context, state, action, (e) => events.push(e))
  if (!result.ok) throw new Error(result.reason)
  return { state: result.state, events }
}

describe('events from the monster phase', () => {
  it('breaks an attack down into attack, card bonus, Pack Tactics and shield', () => {
    // Two goblins next to the Warrior (base shield 1). Skirmish: adjacent monsters attack at +1.
    // Each hit is 2 + 1 + 1 (Pack Tactics) - 1 = 3.
    const state = setUp(
      'warrior',
      { position: at(3, 2) },
      { G1: { pos: at(2, 2) }, G2: { pos: at(4, 2) } },
    )
    const events = record((log) => runMonsterPhase(context, state, 'skirmish', log))
    expect(events).toEqual([
      { kind: 'enemyCardFlipped', card: 'skirmish', deckRefilled: false },
      {
        kind: 'monsterAttacked',
        monster: 'G1',
        attack: 2,
        cardBonus: 1,
        packTactics: 1,
        shield: 1,
        damage: 3,
        healthBefore: 10,
        healthAfter: 7,
      },
      {
        kind: 'monsterAttacked',
        monster: 'G2',
        attack: 2,
        cardBonus: 1,
        packTactics: 1,
        shield: 1,
        damage: 3,
        healthBefore: 7,
        healthAfter: 4,
      },
    ])
  })

  it('reports every acting monster as moving, attacking, or out of reach', () => {
    const state = setUp('warrior')
    const events = record((log) => runMonsterPhase(context, state, 'advance', log))
    expect(events.filter((e) => e.kind === 'monsterMoved').map((e) => e.monster)).toContain('G1')
    for (const id of ['G1', 'G2', 'G3']) {
      expect(
        events.some(
          (e) =>
            (e.kind === 'monsterAttacked' || e.kind === 'monsterOutOfReach') && e.monster === id,
        ),
      ).toBe(true)
    }
  })

  it('reports a frozen monster that could not move', () => {
    const state = setUp('warrior', {}, { G1: { frozen: true } })
    const events = record((log) => runMonsterPhase(context, state, 'advance', log))
    expect(events).toContainEqual({ kind: 'monsterFrozenInPlace', monster: 'G1' })
    expect(events.some((e) => e.kind === 'monsterMoved' && e.monster === 'G1')).toBe(false)
  })

  it('reports Toxic Fumes on Mud, and nothing when no monster can act', () => {
    const onMud = setUp('warrior', { position: at(2, 4) }, { G1: { pos: at(2, 1) } })
    expect(record((log) => runMonsterPhase(context, onMud, 'toxic-fumes', log))).toContainEqual({
      kind: 'toxicFumes',
      damage: 1,
      healthBefore: 10,
      healthAfter: 9,
    })
    const allDead = setUp(
      'warrior',
      {},
      { G1: { health: 0 }, G2: { health: 0 }, G3: { health: 0 } },
    )
    expect(record((log) => runMonsterPhase(context, allDead, undefined, log))).toEqual([
      { kind: 'noMonsterPhase' },
    ])
  })

  it('reports the Unleash Doom reshuffle, and a refilled enemy deck', () => {
    const doom = setUp('warrior', { enemyDraw: ['unleash-doom', 'regroup'] })
    const doomEvents = record((log) => runMonsterPhase(context, doom, undefined, log))
    expect(doomEvents[0]).toEqual({
      kind: 'enemyCardFlipped',
      card: 'unleash-doom',
      deckRefilled: false,
    })
    expect(doomEvents.at(-1)).toEqual({ kind: 'enemyDeckReshuffled' })

    const empty = {
      ...setUp('warrior'),
      enemyDeck: { drawPile: [], discard: ['regroup', 'advance'] },
    }
    const refilled = record((log) => runMonsterPhase(context, empty, undefined, log))
    expect(refilled[0]).toMatchObject({ kind: 'enemyCardFlipped', deckRefilled: true })
  })
})

describe('events from your plays', () => {
  it('reports Charge as a play, a move and a hit, before the monster phase', () => {
    const state = setUp('warrior', {
      hand: ['warrior-charge', 'warrior-sweep'],
      enemyDraw: ['regroup'],
    })
    const { events } = play(state, {
      type: 'play',
      card: 'warrior-charge',
      use: 'A',
      to: at(3, 4),
      target: 'G2',
    })
    expect(events).toEqual([
      { kind: 'played', card: 'warrior-charge', use: 'A', burned: false },
      { kind: 'heroMoved', from: at(3, 1), to: at(3, 4) },
      {
        kind: 'monsterHit',
        monster: 'G2',
        attack: 2,
        armor: 0,
        damage: 2,
        healthBefore: 4,
        healthAfter: 2,
      },
      { kind: 'enemyCardFlipped', card: 'regroup', deckRefilled: false },
    ])
  })

  it('reports a push into Lava and a blocked push', () => {
    // Shield Bash: Attack 2, Push 1. G1 is pushed from B R2C2 down into the Lava at B R3C2.
    const lava = setUp(
      'warrior',
      { hand: ['warrior-shield-bash'], position: at(1, 9), doorOpen: true },
      { G1: { pos: at(2, 9) } },
    )
    const lavaEvents = record((log) =>
      performAction(
        context,
        lava,
        { type: 'play', card: 'warrior-shield-bash', use: 'A', target: 'G1' },
        log,
      ),
    )
    expect(lavaEvents.at(-1)).toEqual({
      kind: 'pushed',
      monster: 'G1',
      from: at(2, 9),
      to: at(3, 9),
      blocked: false,
      lava: true,
      damage: 2,
      healthBefore: 2,
      healthAfter: 0,
    })

    // G2 stands right behind G1, so the push is blocked: 1 damage, no movement.
    const blocked = setUp(
      'warrior',
      { hand: ['warrior-shield-bash'] },
      { G1: { pos: at(3, 2) }, G2: { pos: at(3, 3) } },
    )
    const blockedEvents = record((log) =>
      performAction(
        context,
        blocked,
        { type: 'play', card: 'warrior-shield-bash', use: 'A', target: 'G1' },
        log,
      ),
    )
    expect(blockedEvents.at(-1)).toMatchObject({
      kind: 'pushed',
      from: at(3, 2),
      to: at(3, 2),
      blocked: true,
      damage: 1,
      healthAfter: 1,
    })
  })

  it('reports a burned card and an attack that armor stops', () => {
    const state = setUp(
      'warrior',
      { hand: ['warrior-heavy-blow', 'warrior-sweep'] },
      { O: { pos: at(3, 2), revealed: true, revealedOnRound: null } },
    )
    const burn = record((log) =>
      performAction(
        context,
        state,
        { type: 'play', card: 'warrior-heavy-blow', use: 'A', target: 'O' },
        log,
      ),
    )
    expect(burn[0]).toEqual({ kind: 'played', card: 'warrior-heavy-blow', use: 'A', burned: true })
    expect(burn[1]).toMatchObject({ kind: 'monsterHit', attack: 5, armor: 1, damage: 4 })

    const stopped = record((log) =>
      performAction(
        context,
        state,
        { type: 'play', card: 'warrior-sweep', use: 'attack', target: 'O' },
        log,
      ),
    )
    expect(stopped[1]).toMatchObject({ kind: 'monsterHit', attack: 1, armor: 1, damage: 0 })
  })

  it('reports a shield going up and being cleared after the monster phase', () => {
    const state = setUp('warrior', {
      hand: ['warrior-shield-bash', 'warrior-sweep'],
      enemyDraw: ['regroup'],
    })
    const { events } = play(state, { type: 'play', card: 'warrior-shield-bash', use: 'B' })
    expect(events[1]).toEqual({
      kind: 'shieldShown',
      card: 'warrior-shield-bash',
      value: 2,
      shield: 2,
    })
    expect(events.at(-1)).toEqual({
      kind: 'shieldsCleared',
      discarded: ['warrior-shield-bash'],
      lost: [],
    })
  })

  it('reports a rest', () => {
    const state = setUp('warrior', {
      hand: ['warrior-sweep'],
      discard: ['warrior-cleave', 'warrior-guard-stance', 'warrior-second-wind'],
    })
    const events = record((log) =>
      performAction(context, state, { type: 'rest', lose: 'warrior-cleave' }, log),
    )
    // The draw pile (5) and the 2 kept discards are shuffled together; 4 cards refill the hand.
    expect(events).toEqual([{ kind: 'rested', lost: 'warrior-cleave', shuffled: 7, drew: 4 }])
  })

  it('reports nothing for an action the engine refuses', () => {
    // Force Push along the column moves G1 out of range of its Attack 1 (open question 14).
    const state = setUp('mage', { hand: ['mage-force-push'] }, { G1: { pos: at(2, 2) } })
    const action: HeroAction = {
      type: 'play',
      card: 'mage-force-push',
      use: 'A',
      target: 'G1',
      axis: 'col',
    }
    const events: GameEvent[] = []
    expect(performAction(context, state, action, (e) => events.push(e)).ok).toBe(false)
    expect(events).toEqual([])
  })
})

describe('events at the end of a round and of the game', () => {
  it('reports the Roar discard and the end of the round', () => {
    // The Ogre stands next to the hero. After the second play, Roar asks for a discard.
    const state = setUp(
      'warrior',
      { hand: ['warrior-sweep', 'warrior-cleave'], playsDone: 1, enemyDraw: ['regroup'] },
      { O: { pos: at(3, 2), revealed: true, revealedOnRound: null } },
    )
    const second = play(state, { type: 'play', card: 'warrior-sweep', use: 'B' })
    expect(second.state.phase).toBe('roar')
    const roar = play(second.state, { type: 'discard', card: 'warrior-cleave' })
    expect(roar.events).toEqual([
      { kind: 'roarDiscard', card: 'warrior-cleave' },
      { kind: 'roundEnded', round: 1, drew: 5 },
    ])
  })

  it('reports the end of the game once', () => {
    const state = setUp(
      'warrior',
      { health: 1, hand: ['warrior-sweep'], enemyDraw: ['skirmish'] },
      {
        G1: { pos: at(3, 2) },
      },
    )
    const { events } = play(state, { type: 'play', card: 'warrior-sweep', use: 'B' })
    expect(events.filter((e) => e.kind === 'gameOver')).toEqual([
      { kind: 'gameOver', result: 'defeat-health' },
    ])
    expect(events.at(-1)).toEqual({ kind: 'gameOver', result: 'defeat-health' })
  })

  it('never changes how the game plays: whole bot games end the same with or without a log', () => {
    for (const hero of ['warrior', 'mage'] as const) {
      for (const seed of [1, 2]) {
        const finish = (withLog: boolean) => {
          let state = createGame(context, hero, seed)
          while (!state.result) {
            const action =
              state.phase === 'roar'
                ? {
                    type: 'discard' as const,
                    card: chooseRoarDiscard(context, state) ?? state.deck.hand[0],
                  }
                : chooseAction(context, state, defaultBotWeights)
            if (!action) break
            const result = playAction(context, state, action, withLog ? () => {} : undefined)
            if (!result.ok) throw new Error(result.reason)
            state = result.state
          }
          return state
        }
        expect(finish(true)).toEqual(finish(false))
      }
    }
  })
})
