import { describe, expect, it } from 'vitest'
import { chooseAction, chooseRoarDiscard, defaultBotWeights } from '../engine/bot.ts'
import type { GameEvent } from '../engine/events.ts'
import { createContext, createGame, type GameState } from '../engine/gameState.ts'
import { runMonsterPhase } from '../engine/monsterPhase.ts'
import { playAction } from '../engine/round.ts'
import { addToLog, lastEnemyCard } from './gameLog.ts'
import { describeEvents } from './logText.ts'

const context = createContext()
const at = (row: number, col: number) => ({ row, col })

describe('describeEvents', () => {
  it('spells out a monster attack, naming the enemy card that gave the bonus', () => {
    // Two goblins next to the Warrior; Skirmish gives adjacent monsters +1.
    const start = createGame(context, 'warrior', 1)
    const state: GameState = {
      ...start,
      position: at(3, 2),
      monsters: start.monsters.map((m) =>
        m.id === 'G1' ? { ...m, pos: at(2, 2) } : m.id === 'G2' ? { ...m, pos: at(4, 2) } : m,
      ),
    }
    const events: GameEvent[] = []
    runMonsterPhase(context, state, 'skirmish', (e) => events.push(e))
    expect(describeEvents(context, events).map((line) => line.text)).toEqual([
      'Enemy card: The Skirmish. Monsters adjacent to you: Attack +1. Other monsters do nothing.',
      'Goblin G1 attacks you: 2 + 1 (The Skirmish) + 1 (Pack Tactics) − 1 (shield) = 3 damage. Health 10 → 7.',
      'Goblin G2 attacks you: 2 + 1 (The Skirmish) + 1 (Pack Tactics) − 1 (shield) = 3 damage. Health 7 → 4.',
    ])
  })

  it('describes your plays, burns, armor, Lava and defeats', () => {
    const lines = describeEvents(context, [
      { kind: 'played', card: 'warrior-heavy-blow', use: 'A', burned: true },
      {
        kind: 'monsterHit',
        monster: 'O',
        attack: 5,
        armor: 1,
        damage: 4,
        healthBefore: 10,
        healthAfter: 6,
      },
      {
        kind: 'pushed',
        monster: 'G1',
        from: at(2, 9),
        to: at(3, 9),
        blocked: false,
        lava: true,
        damage: 2,
        healthBefore: 2,
        healthAfter: 0,
      },
      { kind: 'played', card: 'warrior-sweep', use: 'move', burned: false },
      { kind: 'gameOver', result: 'victory' },
    ])
    expect(lines).toEqual([
      {
        kind: 'hero',
        text: 'You play Heavy Blow, half A: Attack 5. It burns: lost for the rest of the scenario.',
      },
      { kind: 'hero', text: 'You hit the Ogre: 5 − 1 (armor) = 4 damage. Health 10 → 6.' },
      {
        kind: 'hero',
        text:
          'You push Goblin G1 into the Lava at row 3, column 9: 2 damage (armor does not count). ' +
          'Health 2 → 0. Goblin G1 is defeated.',
      },
      { kind: 'hero', text: 'You play Sweep as Move 2.' },
      { kind: 'result', text: 'Victory! Every monster is defeated and the chest is looted.' },
    ])
  })

  it('has a sentence for everything that happens in whole bot games', () => {
    for (const hero of ['warrior', 'mage'] as const) {
      for (const seed of [1, 2, 3]) {
        let state = createGame(context, hero, seed)
        const events: GameEvent[] = []
        while (!state.result) {
          const action =
            state.phase === 'roar'
              ? {
                  type: 'discard' as const,
                  card: chooseRoarDiscard(context, state) ?? state.deck.hand[0],
                }
              : chooseAction(context, state, defaultBotWeights)
          if (!action) break
          const result = playAction(context, state, action, (e) => events.push(e))
          if (!result.ok) throw new Error(result.reason)
          state = result.state
        }
        const lines = describeEvents(context, events)
        expect(lines).toHaveLength(events.length)
        for (const line of lines) {
          expect(line.text).toMatch(/^[A-Z].*[.!]$/)
          expect(line.text).not.toMatch(/undefined|NaN|\.\./)
        }
      }
    }
  })
})

describe('the log kept by the UI', () => {
  it('groups events by the round they happened in', () => {
    let log = addToLog([], 1, [{ kind: 'enemyCardFlipped', card: 'frenzy', deckRefilled: false }])
    log = addToLog(log, 1, [{ kind: 'roundEnded', round: 1, drew: 2 }])
    log = addToLog(log, 2, [])
    log = addToLog(log, 2, [{ kind: 'enemyCardFlipped', card: 'regroup', deckRefilled: false }])
    expect(log.map((r) => [r.round, r.events.length])).toEqual([
      [1, 2],
      [2, 1],
    ])
  })

  it('remembers the last enemy card even after Unleash Doom empties the enemy discard pile', () => {
    const log = addToLog([], 3, [
      { kind: 'enemyCardFlipped', card: 'unleash-doom', deckRefilled: false },
      { kind: 'enemyDeckReshuffled' },
    ])
    expect(lastEnemyCard(log)).toBe('unleash-doom')
    expect(lastEnemyCard([])).toBeUndefined()
  })
})

describe('enemy card names with their own punctuation', () => {
  it('does not add a full stop after "Flanked!"', () => {
    const [line] = describeEvents(context, [
      { kind: 'enemyCardFlipped', card: 'flanked', deckRefilled: false },
    ])
    expect(line.text).toMatch(/^Enemy card: Flanked! All monsters/)
  })
})
