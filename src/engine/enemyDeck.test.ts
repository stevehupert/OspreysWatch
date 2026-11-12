import { describe, expect, it } from 'vitest'
import { scenarioRules } from './data/config.ts'
import { enemyDeck } from './data/enemyDeck.ts'
import {
  afterEnemyCardResolves,
  createEnemyDeck,
  enemyAttackBonus,
  flipEnemyCard,
  type EnemyDeck,
} from './enemyDeck.ts'
import { createRandom } from './random.ts'

function card(id: string) {
  const found = enemyDeck.find((c) => c.id === id)
  if (!found) throw new Error(`No test card ${id}`)
  return found
}

function allCards(deck: EnemyDeck): string[] {
  return [...deck.drawPile, ...deck.discard].sort()
}

const fullDeck = createEnemyDeck(enemyDeck, createRandom(1)).deck
const allIds = allCards(fullDeck)

describe('createEnemyDeck', () => {
  it('puts in all 15 cards, with 4 Advance and 2 Unleash Doom', () => {
    expect(fullDeck.drawPile).toHaveLength(15)
    expect(fullDeck.discard).toEqual([])
    expect(fullDeck.drawPile.filter((id) => id === 'advance')).toHaveLength(4)
    expect(fullDeck.drawPile.filter((id) => id === 'unleash-doom')).toHaveLength(2)
  })

  it('gives the same order for the same seed and different orders across seeds', () => {
    expect(createEnemyDeck(enemyDeck, createRandom(6))).toEqual(
      createEnemyDeck(enemyDeck, createRandom(6)),
    )
    const orders = new Set(
      [1, 2, 3, 4, 5].map((seed) =>
        createEnemyDeck(enemyDeck, createRandom(seed)).deck.drawPile.join(),
      ),
    )
    expect(orders.size).toBeGreaterThan(1)
  })
})

describe('flipEnemyCard', () => {
  it('returns the top card and moves it to the discard pile', () => {
    const deck: EnemyDeck = { drawPile: ['frenzy', 'regroup'], discard: ['advance'] }
    const flipped = flipEnemyCard(deck, enemyDeck, createRandom(1))
    expect(flipped.card.name).toBe('Frenzy')
    expect(flipped.deck).toEqual({ drawPile: ['regroup'], discard: ['advance', 'frenzy'] })
  })

  it('shuffles the discard pile into a new draw pile when the draw pile is empty', () => {
    const deck: EnemyDeck = { drawPile: [], discard: ['advance', 'skirmish', 'enrage'] }
    const flipped = flipEnemyCard(deck, enemyDeck, createRandom(2))
    expect(flipped.deck.drawPile).toHaveLength(2)
    expect(flipped.deck.discard).toEqual([flipped.card.id])
    expect(allCards(flipped.deck)).toEqual(['advance', 'enrage', 'skirmish'])
  })

  it('is repeatable when it reshuffles', () => {
    const deck: EnemyDeck = { drawPile: [], discard: ['advance', 'skirmish', 'enrage', 'frenzy'] }
    expect(flipEnemyCard(deck, enemyDeck, createRandom(3))).toEqual(
      flipEnemyCard(deck, enemyDeck, createRandom(3)),
    )
  })

  it('fails clearly if there are no cards at all, or the card id is unknown', () => {
    expect(() => flipEnemyCard({ drawPile: [], discard: [] }, enemyDeck, createRandom(1))).toThrow(
      /both empty/,
    )
    expect(() =>
      flipEnemyCard({ drawPile: ['volley'], discard: [] }, enemyDeck, createRandom(1)),
    ).toThrow(/Unknown enemy card/)
  })

  it('cycles through the whole deck before repeating any card', () => {
    let deck = fullDeck
    let random = createRandom(10)
    const flipped: string[] = []
    for (let i = 0; i < 15; i++) {
      const result = flipEnemyCard(deck, enemyDeck, random)
      flipped.push(result.card.id)
      deck = result.deck
      random = result.random
    }
    expect(flipped.sort()).toEqual(allIds)
  })
})

describe('afterEnemyCardResolves', () => {
  it('does nothing for a card without a reshuffle', () => {
    const deck: EnemyDeck = { drawPile: ['regroup'], discard: ['advance'] }
    const random = createRandom(1)
    expect(afterEnemyCardResolves(deck, card('advance'), random)).toEqual({ deck, random })
  })

  it('after Unleash Doom, shuffles the discard (Doom included) together with the draw pile', () => {
    const deck: EnemyDeck = {
      drawPile: ['regroup', 'frenzy'],
      discard: ['advance', 'skirmish', 'unleash-doom'],
    }
    const result = afterEnemyCardResolves(deck, card('unleash-doom'), createRandom(4))
    expect(result.deck.discard).toEqual([])
    expect([...result.deck.drawPile].sort()).toEqual(
      ['advance', 'frenzy', 'regroup', 'skirmish', 'unleash-doom'].sort(),
    )
  })
})

describe('enemyAttackBonus', () => {
  it('uses the card bonus, or the campaign tier for Unleash Doom', () => {
    expect(enemyAttackBonus(card('skirmish'))).toBe(1)
    expect(enemyAttackBonus(card('advance'))).toBe(0)
    expect(enemyAttackBonus(card('unleash-doom'))).toBe(1)
    expect(enemyAttackBonus(card('unleash-doom'), { ...scenarioRules, campaignTier: 3 })).toBe(3)
  })
})
