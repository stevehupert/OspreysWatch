import { describe, expect, it } from 'vitest'
import { monsterStats } from './data/monsters.ts'
import type { HeroId } from './data/heroes.ts'
import {
  actingMonsters,
  createContext,
  createGame,
  currentShield,
  findMonster,
  type GameState,
  type MonsterState,
} from './gameState.ts'
import { performAction, type HeroAction } from './heroActions.ts'
import { runMonsterPhase } from './monsterPhase.ts'
import { endRound, failIfExhausted, playAction } from './round.ts'

const context = createContext()
const at = (row: number, col: number) => ({ row, col })

function start(hero: HeroId = 'warrior'): GameState {
  return createGame(context, hero, 1)
}

function withHand(state: GameState, hand: string[]): GameState {
  return { ...state, deck: { ...state.deck, hand } }
}

function withMonsters(state: GameState, patch: Record<string, Partial<MonsterState>>): GameState {
  return { ...state, monsters: state.monsters.map((m) => ({ ...m, ...patch[m.id] })) }
}

function perform(state: GameState, action: HeroAction): GameState {
  const result = performAction(context, state, action)
  if (!result.ok) throw new Error(result.reason)
  return result.state
}

const reveal = { revealed: true, revealedOnRound: null }

describe('a new game', () => {
  it('sets up the Warrior on Scenario 1', () => {
    const state = start()
    expect(state.health).toBe(10)
    expect(state.position).toEqual(at(3, 1))
    expect(state.deck.hand).toHaveLength(5)
    expect(state.deck.drawPile).toHaveLength(5)
    expect(state.enemyDeck.drawPile).toHaveLength(15)
    expect(state.monsters.map((m) => [m.id, m.health, m.revealed])).toEqual([
      ['G1', 4, true],
      ['G2', 4, true],
      ['G3', 4, true],
      ['O', 10, false],
    ])
  })

  it('plays the same way every time for the same seed', () => {
    expect(createGame(context, 'mage', 7)).toEqual(createGame(context, 'mage', 7))
    expect(createGame(context, 'mage', 7).deck.hand).not.toEqual(
      createGame(context, 'mage', 8).deck.hand,
    )
  })
})

describe('moving', () => {
  it('charges 2 to enter Mud', () => {
    const state = withHand(
      withMonsters({ ...start(), position: at(3, 3) }, { G1: { health: 0 }, G2: { health: 0 } }),
      ['warrior-cleave', 'warrior-quick-strike'],
    )
    // Generic Move 2 cannot reach the Mud at A R2C4 (up 1, then Mud 2 = 3).
    const tooFar = performAction(context, state, {
      type: 'play',
      card: 'warrior-cleave',
      use: 'move',
      to: at(2, 4),
    })
    expect(tooFar.ok).toBe(false)
    // Quick Strike's Move 3 can.
    const moved = perform(state, {
      type: 'play',
      card: 'warrior-quick-strike',
      use: 'B',
      to: at(2, 4),
    })
    expect(moved.position).toEqual(at(2, 4))
  })

  it('cannot enter a space with a monster in it', () => {
    const state = withHand({ ...start(), position: at(3, 3) }, ['warrior-quick-strike'])
    const result = performAction(context, state, {
      type: 'play',
      card: 'warrior-quick-strike',
      use: 'B',
      to: at(2, 4), // G1 stands there
    })
    expect(result.ok).toBe(false)
  })
})

describe('the door', () => {
  const nextToDoor = withHand({ ...start(), position: at(3, 6) }, ['warrior-quick-strike'])

  it('opens when you step onto it, and the Ogre does not act that round', () => {
    const state = perform(nextToDoor, {
      type: 'play',
      card: 'warrior-quick-strike',
      use: 'B',
      to: at(3, 7),
    })
    expect(state.doorOpen).toBe(true)
    expect(findMonster(state, 'O')).toMatchObject({ revealed: true, revealedOnRound: 1 })
    expect(actingMonsters(state).map((m) => m.id)).not.toContain('O')
    expect(actingMonsters({ ...state, round: 2 }).map((m) => m.id)).toContain('O')
  })

  it('ends the move: you cannot walk through a door you just opened', () => {
    const result = performAction(context, nextToDoor, {
      type: 'play',
      card: 'warrior-quick-strike',
      use: 'B',
      to: at(3, 8),
    })
    expect(result.ok).toBe(false)
  })

  describe('when set to open by Interact', () => {
    const interactContext = createContext({ rules: { doorOpensBy: 'interact' } })
    const state = withHand({ ...start(), position: at(3, 6) }, ['warrior-quick-strike'])

    it('cannot be stepped onto', () => {
      const result = performAction(interactContext, state, {
        type: 'play',
        card: 'warrior-quick-strike',
        use: 'B',
        to: at(3, 7),
      })
      expect(result.ok).toBe(false)
    })

    it('opens with an Interact play from next to it', () => {
      const result = performAction(interactContext, state, {
        type: 'play',
        card: 'warrior-quick-strike',
        use: 'interact',
      })
      expect(result.ok && result.state.doorOpen).toBe(true)
    })

    it('is not available when the door opens by stepping', () => {
      const result = performAction(context, state, {
        type: 'play',
        card: 'warrior-quick-strike',
        use: 'interact',
      })
      expect(result.ok).toBe(false)
    })
  })
})

describe('attacks and pushes', () => {
  // The Ogre (armor 1) stands at B R4C4 = (4,11). Lava is at (4,10) to its west.
  const ogreAt = (row: number, col: number) =>
    withMonsters(start(), { O: { ...reveal, pos: at(row, col) } })

  it('subtracts armor from attack damage', () => {
    const state = withHand({ ...ogreAt(4, 11), position: at(4, 12) }, ['warrior-quick-strike'])
    const after = perform(state, {
      type: 'play',
      card: 'warrior-quick-strike',
      use: 'A',
      target: 'O',
    })
    expect(findMonster(after, 'O')?.health).toBe(10 - (3 - monsterStats.ogre.armor))
  })

  it('pushing into Lava deals 2 ignoring armor', () => {
    const state = withHand({ ...ogreAt(4, 11), position: at(4, 12) }, ['warrior-shield-bash'])
    const after = perform(state, {
      type: 'play',
      card: 'warrior-shield-bash',
      use: 'A',
      target: 'O',
    })
    // Attack 2 - armor 1 = 1, pushed west into Lava at (4,10): 2 more.
    expect(findMonster(after, 'O')).toMatchObject({ health: 7, pos: at(4, 10) })
  })

  it('a push blocked by the edge of the map deals the blocked-push damage', () => {
    const state = withHand({ ...ogreAt(1, 11), position: at(2, 11) }, ['warrior-shield-bash'])
    const after = perform(state, {
      type: 'play',
      card: 'warrior-shield-bash',
      use: 'A',
      target: 'O',
    })
    // Attack 2 - armor 1 = 1, then blocked: 1 more, ignoring armor.
    expect(findMonster(after, 'O')).toMatchObject({ health: 8, pos: at(1, 11) })
  })

  it('a push blocked by Rubble stops early and hurts', () => {
    // Goblin G1 east of the hero would be pushed into Rubble at A R2C5.
    const state = withHand(
      withMonsters({ ...start(), position: at(2, 3) }, { G1: { pos: at(2, 4) } }),
      ['warrior-shield-bash'],
    )
    const after = perform(state, {
      type: 'play',
      card: 'warrior-shield-bash',
      use: 'A',
      target: 'G1',
    })
    expect(findMonster(after, 'G1')).toMatchObject({ health: 4 - 2 - 1, pos: at(2, 4) })
  })

  it('Force Push pushes first, then attacks the same target if it is still in range', () => {
    const state = withHand(
      withMonsters({ ...start('mage'), position: at(4, 12) }, { O: { ...reveal, pos: at(4, 11) } }),
      ['mage-force-push'],
    )
    const after = perform(state, { type: 'play', card: 'mage-force-push', use: 'A', target: 'O' })
    // Pushed west into Lava at (4,10): 2 damage, and the push stops there. Attack 1 - armor 1 = 0.
    expect(findMonster(after, 'O')).toMatchObject({ health: 8, pos: at(4, 10) })
  })

  it('a diagonal push needs the longer axis, or a choice when the distances tie', () => {
    const push = (hero: [number, number], ogre: [number, number], axis?: 'row' | 'col') =>
      performAction(
        context,
        withHand(
          withMonsters(
            { ...start('mage'), position: at(...hero) },
            { O: { ...reveal, pos: at(...ogre) } },
          ),
          ['mage-force-push'],
        ),
        { type: 'play', card: 'mage-force-push', use: 'A', target: 'O', axis },
      )
    const reason = (result: ReturnType<typeof push>) => (result.ok ? 'ok' : result.reason)
    // Equal row and column distance: the player must choose.
    expect(reason(push([4, 12], [3, 11]))).toMatch(/tie/)
    // 2 rows and 1 column apart: the row axis is longer, so choosing the column is refused.
    expect(reason(push([4, 12], [2, 11], 'col'))).toMatch(/longer axis/)
    // A legal choice gets past the axis check (it fails later only because the push moves it out of range).
    expect(reason(push([4, 12], [3, 11], 'row'))).not.toMatch(/tie|longer axis/)
  })

  it('cannot target a hidden monster', () => {
    const state = withHand({ ...start(), position: at(4, 12) }, ['warrior-quick-strike'])
    const result = performAction(context, state, {
      type: 'play',
      card: 'warrior-quick-strike',
      use: 'A',
      target: 'O',
    })
    expect(result.ok).toBe(false)
  })

  it('Sweep hits every adjacent enemy', () => {
    const state = withHand(withMonsters({ ...start(), position: at(3, 4) }, {}), ['warrior-sweep'])
    const after = perform(state, { type: 'play', card: 'warrior-sweep', use: 'A' })
    expect(findMonster(after, 'G1')?.health).toBe(2)
    expect(findMonster(after, 'G2')?.health).toBe(2)
    expect(findMonster(after, 'G3')?.health).toBe(4)
  })

  it('Meteor also hits enemies next to the target, and burns the card', () => {
    const state = withHand({ ...start('mage'), position: at(3, 2) }, ['mage-meteor'])
    // G1 at (2,4) and G2 at (4,4) are not adjacent to each other, so only the target is hit...
    const alone = perform(state, { type: 'play', card: 'mage-meteor', use: 'A', target: 'G1' })
    expect(findMonster(alone, 'G2')?.health).toBe(4)
    expect(alone.deck.lost).toEqual(['mage-meteor'])
    // ...but a Goblin standing next to the target takes 3 as well.
    const crowded = withMonsters(state, { G2: { pos: at(2, 3) } })
    const both = perform(crowded, { type: 'play', card: 'mage-meteor', use: 'A', target: 'G1' })
    expect(findMonster(both, 'G1')?.health).toBe(1)
    expect(findMonster(both, 'G2')?.health).toBe(1)
  })

  it('Frost Snare keeps the target from moving in the next monster phase', () => {
    const state = withHand({ ...start('mage'), position: at(3, 2) }, ['mage-frost-snare'])
    const frozen = perform(state, {
      type: 'play',
      card: 'mage-frost-snare',
      use: 'A',
      target: 'G1',
    })
    expect(findMonster(frozen, 'G1')?.frozen).toBe(true)
    const after = runMonsterPhase(context, frozen, 'advance')
    expect(findMonster(after, 'G1')).toMatchObject({ pos: at(2, 4), frozen: false })
    expect(findMonster(after, 'G2')?.pos).not.toEqual(at(4, 4)) // an unfrozen Goblin moved
  })
})

describe('healing and shields', () => {
  it('Heal does not go above maximum health', () => {
    const state = withHand({ ...start('mage'), health: 6 }, ['mage-mend'])
    expect(perform(state, { type: 'play', card: 'mage-mend', use: 'A' }).health).toBe(7)
  })

  it('a shield half goes face-up and counts only while showing', () => {
    const state = withHand(start(), ['warrior-hold-the-line'])
    const after = perform(
      { ...state, health: 5 },
      {
        type: 'play',
        card: 'warrior-hold-the-line',
        use: 'A',
      },
    )
    expect(currentShield(after)).toBe(2)
    expect(after.health).toBe(6)
    expect(after.deck.showing.map((s) => s.cardId)).toEqual(['warrior-hold-the-line'])
    expect(after.deck.discard).toEqual([])
  })

  it('shields are cleared by the monster phase, and burned ones are lost', () => {
    const state = withHand({ ...start('mage'), position: at(3, 3) }, ['mage-barrier'])
    const shielded = perform(state, { type: 'play', card: 'mage-barrier', use: 'A' })
    expect(currentShield(shielded)).toBe(3)
    const after = runMonsterPhase(context, shielded, 'regroup')
    expect(after.deck.showing).toEqual([])
    expect(after.deck.lost).toEqual(['mage-barrier'])
  })

  it('shields stay up when no monster can act', () => {
    const quiet = withMonsters(withHand(start(), ['warrior-hold-the-line']), {
      G1: { health: 0 },
      G2: { health: 0 },
      G3: { health: 0 },
    })
    const shielded = perform(quiet, { type: 'play', card: 'warrior-hold-the-line', use: 'A' })
    const after = runMonsterPhase(context, shielded)
    expect(after.deck.showing).toHaveLength(1)
    expect(after.enemyDeck).toEqual(shielded.enemyDeck) // nothing was flipped
  })
})

describe('the monster phase', () => {
  it('Pack Tactics adds 1 only when another Goblin is also next to you', () => {
    const both = withMonsters({ ...start(), position: at(3, 4) }, {}) // next to G1 (2,4) and G2 (4,4)
    const afterBoth = runMonsterPhase(context, both, 'skirmish')
    // Each: 2 + 1 (card) + 1 (pack) - 1 (Warrior shield) = 3. Two Goblins: 6.
    expect(afterBoth.health).toBe(10 - 6)

    const alone = withMonsters(both, { G2: { pos: at(4, 6) } })
    const afterAlone = runMonsterPhase(context, alone, 'skirmish')
    expect(afterAlone.health).toBe(10 - 2) // 2 + 1 - 1 = 2
  })

  it('Toxic Fumes hurts only on Mud, and shields do not help', () => {
    const onMud = {
      ...start(),
      position: at(2, 4),
      monsters: start().monsters.map((m) => ({ ...m, pos: at(4, 6) })),
    }
    expect(runMonsterPhase(context, onMud, 'toxic-fumes').health).toBe(9)
    expect(runMonsterPhase(context, { ...onMud, position: at(3, 4) }, 'toxic-fumes').health).toBe(
      10,
    )
  })

  it('Frenzy makes only the closest monster attack, twice', () => {
    const state = { ...start(), position: at(3, 4) } // G1 and G2 both adjacent; G1 is first by row
    const after = runMonsterPhase(context, state, 'frenzy')
    // Closest is G1 (tie on distance, lower row). 2 attacks of 2 + 1 (pack) - 1 = 2 each.
    expect(after.health).toBe(10 - 4)
  })

  it('moves a Goblin toward the hero by the cheapest route, up to its Move', () => {
    const after = runMonsterPhase(context, start(), 'flanked')
    // G1 at (2,4) can reach (2,1) or (3,2) next to the hero for the same cost (3); the lower row wins.
    expect(findMonster(after, 'G1')?.pos).toEqual(at(2, 1))
  })

  it('does not flip or move anything when no monster can act', () => {
    const hidden = withMonsters(start(), {
      G1: { health: 0 },
      G2: { health: 0 },
      G3: { health: 0 },
    })
    expect(runMonsterPhase(context, hidden)).toBe(hidden)
  })
})

describe('looting and winning', () => {
  const nextToChest = (state: GameState): GameState => ({ ...state, position: at(5, 12) })

  it('looting the chest heals 4 and, with every monster dead, wins', () => {
    const dead = withMonsters(
      withHand(nextToChest({ ...start(), health: 3 }), ['warrior-cleave']),
      {
        G1: { health: 0 },
        G2: { health: 0 },
        G3: { health: 0 },
        O: { health: 0 },
      },
    )
    const after = perform(dead, { type: 'play', card: 'warrior-cleave', use: 'loot' })
    expect(after).toMatchObject({ looted: true, health: 7, result: 'victory' })
  })

  it('does not win while a monster lives', () => {
    const state = withHand(nextToChest(start()), ['warrior-cleave'])
    const after = perform(state, { type: 'play', card: 'warrior-cleave', use: 'loot' })
    expect(after.looted).toBe(true)
    expect(after.result).toBeNull()
  })

  it('cannot loot from a distance', () => {
    const state = withHand({ ...start(), position: at(5, 11) }, ['warrior-cleave'])
    expect(
      performAction(context, state, { type: 'play', card: 'warrior-cleave', use: 'loot' }).ok,
    ).toBe(false)
  })

  it('loses when health reaches 0', () => {
    const state = { ...start(), position: at(3, 4), health: 2 }
    const after = runMonsterPhase(context, state, 'skirmish')
    expect(after).toMatchObject({ health: 0, result: 'defeat-health', phase: 'over' })
  })
})

describe('resting', () => {
  const withDiscard = (state: GameState) => ({
    ...state,
    deck: { ...state.deck, hand: [], discard: ['warrior-cleave', 'warrior-sweep'] },
  })

  it('loses the chosen card and refills the hand', () => {
    const after = perform(withDiscard(start()), { type: 'rest', lose: 'warrior-cleave' })
    expect(after.deck.lost).toEqual(['warrior-cleave'])
    expect(after.deck.discard).toEqual([])
    expect(after.deck.hand).toHaveLength(5)
  })

  it('is allowed only once per round', () => {
    const rested = { ...withDiscard(start()), restsThisRound: 1 }
    expect(performAction(context, rested, { type: 'rest', lose: 'warrior-cleave' }).ok).toBe(false)
  })

  it('needs at least 2 cards in the discard pile', () => {
    const state = withDiscard(start())
    const one = { ...state, deck: { ...state.deck, discard: ['warrior-cleave'] } }
    expect(performAction(context, one, { type: 'rest', lose: 'warrior-cleave' }).ok).toBe(false)
  })

  it('with no cards in hand and too few discards, you are exhausted', () => {
    const state = withDiscard(start())
    const stuck = { ...state, deck: { ...state.deck, discard: ['warrior-cleave'] } }
    expect(failIfExhausted(context, stuck)).toMatchObject({
      result: 'defeat-exhausted',
      phase: 'over',
    })
    expect(failIfExhausted(context, state).result).toBeNull()
  })
})

describe('a round', () => {
  const sweepAndMove = (state: GameState) =>
    withHand(state, [
      'warrior-quick-strike',
      'warrior-cleave',
      'warrior-sweep',
      'warrior-heavy-blow',
      'warrior-charge',
    ])

  it('runs the monster phase after the first play and ends after the second', () => {
    let state = sweepAndMove(start())
    const first = playAction(context, state, {
      type: 'play',
      card: 'warrior-quick-strike',
      use: 'B',
    })
    expect(first.ok).toBe(true)
    state = first.ok ? first.state : state
    expect(state).toMatchObject({ round: 1, playsDone: 1, phase: 'play' })
    expect(state.enemyDeck.discard).toHaveLength(1) // one enemy card was flipped

    const second = playAction(context, state, { type: 'play', card: 'warrior-cleave', use: 'B' })
    expect(second.ok).toBe(true)
    state = second.ok ? second.state : state
    expect(state).toMatchObject({ round: 2, playsDone: 0, restsThisRound: 0 })
    expect(state.deck.hand).toHaveLength(5) // drew back up (the draw pile had 5)
  })

  it('makes you pay for Frightening Roar when the Ogre is within 2 at the end of the round', () => {
    const near = withMonsters(
      { ...sweepAndMove(start()), position: at(4, 9), doorOpen: true },
      { O: { ...reveal, pos: at(4, 11) }, G1: { health: 0 }, G2: { health: 0 }, G3: { health: 0 } },
    )
    let state = near
    for (const card of ['warrior-quick-strike', 'warrior-cleave']) {
      const result = playAction(context, state, {
        type: 'play',
        card,
        use: 'B',
        to: state.position,
      })
      if (!result.ok) throw new Error(result.reason)
      state = result.state
    }
    expect(state.phase).toBe('roar')
    expect(state.round).toBe(1)

    const wrong = playAction(context, state, { type: 'play', card: 'warrior-sweep', use: 'A' })
    expect(wrong.ok).toBe(false)

    const paid = playAction(context, state, { type: 'discard', card: 'warrior-sweep' })
    if (!paid.ok) throw new Error(paid.reason)
    expect(paid.state.round).toBe(2)
    expect(paid.state.deck.discard).toContain('warrior-sweep')
  })

  it('no Roar when the Ogre is out of range', () => {
    const state = withMonsters(
      { ...sweepAndMove(start()), position: at(4, 8), doorOpen: true },
      { O: { ...reveal, pos: at(4, 12) } },
    )
    expect(endRound(context, state).phase).toBe('play')
    expect(endRound(context, state).deck.discard).toEqual([])
  })

  it('refuses plays once the game is over', () => {
    const over = { ...start(), phase: 'over' as const, result: 'victory' as const }
    expect(playAction(context, over, { type: 'rest', lose: 'x' }).ok).toBe(false)
  })
})
