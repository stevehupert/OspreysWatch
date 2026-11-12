// Replays the two reference games recorded from the Python simulator and checks that the engine
// ends every round in exactly the same state. Shuffles are scripted so no random generator is involved.

import { describe, expect, it } from 'vitest'
import { mageReference } from './fixtures/mageReference.ts'
import type { RefAction, RefSnapshot, ReferenceGame } from './fixtures/referenceGameTypes.ts'
import { warriorReference } from './fixtures/warriorReference.ts'
import { createContext, createGame, type GameState } from './gameState.ts'
import type { HeroAction } from './heroActions.ts'
import { playAction } from './round.ts'
import type { Shuffler } from './random.ts'

const slug = (name: string) => name.toLowerCase().replaceAll(' ', '-')

/** A shuffler that returns the next recorded order, keeping only the cards actually being shuffled. */
function scripted(label: string, orders: readonly (readonly string[])[]): Shuffler {
  let next = 0
  return (items, state) => {
    const order = orders[next++]
    if (!order) throw new Error(`${label} shuffle #${next} was not scripted`)
    const available = [...items]
    const result: (typeof items)[number][] = []
    for (const id of order) {
      const at = available.indexOf(id as (typeof items)[number])
      if (at !== -1) {
        result.push(available[at])
        available.splice(at, 1)
      }
    }
    if (available.length > 0) throw new Error(`${label} shuffle #${next} is missing ${available}`)
    return { items: result, state }
  }
}

function toAction(game: ReferenceGame, action: RefAction): HeroAction {
  const cardId = (name: string) => `${game.hero}-${slug(name)}`
  if (action.type === 'rest') return { type: 'rest', lose: cardId(action.lose) }
  if (action.type === 'discard') return { type: 'discard', card: cardId(action.card) }
  const { card, returns, ...rest } = action
  return { ...rest, card: cardId(card), ...(returns && { returns: returns.map(cardId) }) }
}

function snapshot(game: ReferenceGame, state: GameState): RefSnapshot {
  const names = new Map<string, string>(
    game.deal.map((name) => [`${game.hero}-${slug(name)}`, name]),
  )
  const name = (id: string) => names.get(id) as string
  return {
    round: state.round,
    result: state.result,
    hp: state.health,
    pos: state.position,
    doorOpen: state.doorOpen,
    looted: state.looted,
    monsters: Object.fromEntries(
      state.monsters.map((m) => [m.id, { pos: m.pos, hp: m.health, revealed: m.revealed }]),
    ),
    hand: state.deck.hand.map(name).sort(),
    draw: state.deck.drawPile.map(name),
    discard: state.deck.discard.map(name).sort(),
    lost: state.deck.lost.map(name).sort(),
    showing: state.deck.showing.map((s) => name(s.cardId)).sort(),
  }
}

function replay(game: ReferenceGame, doorOpensBy: 'step' | 'interact' = 'step') {
  const context = createContext({
    rules: { doorOpensBy },
    shuffleHero: scripted(
      'hero',
      [game.deal, ...game.heroShuffles].map((order) => order.map((n) => `${game.hero}-${slug(n)}`)),
    ),
    shuffleEnemy: scripted(
      'enemy',
      [game.enemyOrder, ...game.enemyShuffles].map((order) => order.map(slug)),
    ),
  })
  let state = createGame(context, game.hero, 1)
  const afterEachRound: RefSnapshot[] = []
  for (const round of game.rounds) {
    for (const action of round.actions) {
      const result = playAction(context, state, toAction(game, action))
      if (!result.ok)
        throw new Error(`Round ${state.round}: ${JSON.stringify(action)}: ${result.reason}`)
      state = result.state
    }
    afterEachRound.push(snapshot(game, state))
  }
  return { state, afterEachRound }
}

describe.each([warriorReference, mageReference])('reference game: $name', (game) => {
  it('starts with the recorded opening hand and draw pile', () => {
    const context = createContext({
      shuffleHero: scripted('hero', [game.deal.map((n) => `${game.hero}-${slug(n)}`)]),
      shuffleEnemy: scripted('enemy', [game.enemyOrder.map(slug)]),
    })
    const state = createGame(context, game.hero, 1)
    expect(state.deck.hand).toEqual(game.deal.slice(0, 5).map((n) => `${game.hero}-${slug(n)}`))
    expect(state.enemyDeck.drawPile).toEqual(game.enemyOrder.map(slug))
  })

  it('ends every round in the recorded state', () => {
    const { afterEachRound } = replay(game)
    game.rounds.forEach((round, index) => {
      expect(afterEachRound[index], `after round ${index + 1}`).toEqual(round.after)
    })
  })

  it('finishes with the recorded result', () => {
    const { state } = replay(game)
    expect(state.result).toBe(game.result)
    expect(state.round).toBe(game.roundsPlayed)
  })
})
