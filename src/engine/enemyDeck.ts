// The shared enemy deck (rules-spec section 7).
//
// Piles hold card definition ids. Copies of a card are identical, so the same
// id appears once per copy (for example 'advance' four times).

import { scenarioRules as defaultScenarioRules, type ScenarioRules } from './data/config.ts'
import type { EnemyCardDefinition } from './data/enemyDeck.ts'
import { shuffle, type RandomState } from './random.ts'

export interface EnemyDeck {
  /** Index 0 is the top of the pile. */
  readonly drawPile: readonly string[]
  readonly discard: readonly string[]
}

/** Put in every copy of every card and shuffle. */
export function createEnemyDeck(
  cards: readonly EnemyCardDefinition[],
  random: RandomState,
): { deck: EnemyDeck; random: RandomState } {
  const ids = cards.flatMap((card) => Array.from({ length: card.count }, () => card.id))
  const shuffled = shuffle(ids, random)
  return { deck: { drawPile: shuffled.items, discard: [] }, random: shuffled.state }
}

/**
 * Flip the top card. It goes to the discard pile. If the draw pile is empty,
 * the discard pile is shuffled to form a new draw pile first.
 */
export function flipEnemyCard(
  deck: EnemyDeck,
  cards: readonly EnemyCardDefinition[],
  random: RandomState,
): { card: EnemyCardDefinition; deck: EnemyDeck; random: RandomState } {
  let drawPile = deck.drawPile
  let discard = deck.discard
  let state = random
  if (drawPile.length === 0) {
    if (discard.length === 0) {
      throw new Error('Cannot flip: the enemy deck and its discard pile are both empty')
    }
    const shuffled = shuffle(discard, state)
    drawPile = shuffled.items
    discard = []
    state = shuffled.state
  }
  const [topId, ...rest] = drawPile
  return {
    card: findCard(cards, topId),
    deck: { drawPile: rest, discard: [...discard, topId] },
    random: state,
  }
}

/**
 * Call after the flipped card has resolved. If the card reshuffles (Unleash Doom),
 * shuffle the discard pile, the card itself included, together with the draw pile.
 */
export function afterEnemyCardResolves(
  deck: EnemyDeck,
  card: EnemyCardDefinition,
  random: RandomState,
): { deck: EnemyDeck; random: RandomState } {
  if (!card.reshuffle) {
    return { deck, random }
  }
  const shuffled = shuffle([...deck.drawPile, ...deck.discard], random)
  return { deck: { drawPile: shuffled.items, discard: [] }, random: shuffled.state }
}

/** The card's attack bonus as a number ("+X" becomes the campaign tier). */
export function enemyAttackBonus(
  card: EnemyCardDefinition,
  rules: ScenarioRules = defaultScenarioRules,
): number {
  return card.attackBonus === 'campaignTier' ? rules.campaignTier : card.attackBonus
}

function findCard(cards: readonly EnemyCardDefinition[], id: string): EnemyCardDefinition {
  const card = cards.find((c) => c.id === id)
  if (!card) {
    throw new Error(`Unknown enemy card "${id}"`)
  }
  return card
}
