// A hero's cards across the five piles (rules-spec sections 4-6).
//
// Every function returns a new deck and leaves its input unchanged.
// Functions that shuffle take and return the random state.

import type { CardDefinition } from './data/cardTypes.ts'
import { deckRules as defaultDeckRules, type DeckRules } from './data/config.ts'
import { shuffle, type RandomState, type Shuffler } from './random.ts'

/** A shield card that is face-up until the next monster phase resolves. */
export interface ShowingShield {
  readonly cardId: string
  readonly value: number
  /** The shield half was a Burn half, so the card goes to the lost pile when cleared. */
  readonly burned: boolean
}

export interface HeroDeck {
  /** Index 0 is the top of the pile. */
  readonly drawPile: readonly string[]
  readonly hand: readonly string[]
  readonly discard: readonly string[]
  readonly showing: readonly ShowingShield[]
  readonly lost: readonly string[]
}

/** Which way a card is played: one of its halves, or the generic Move 2 / Attack 1 / Loot / Interact. */
export type CardUse = 'A' | 'B' | 'generic'

/** Shuffle the hero's cards and draw a starting hand. */
export function createDeck(
  cards: readonly CardDefinition[],
  random: RandomState,
  rules: DeckRules = defaultDeckRules,
  shuffler: Shuffler = shuffle,
): { deck: HeroDeck; random: RandomState } {
  const ids = cards.map((card) => card.id)
  if (new Set(ids).size !== ids.length) {
    throw new Error('A deck cannot contain the same card id twice')
  }
  const shuffled = shuffler(ids, random)
  const empty: HeroDeck = { drawPile: shuffled.items, hand: [], discard: [], showing: [], lost: [] }
  return { deck: drawUpTo(empty, rules), random: shuffled.state }
}

/**
 * Draw from the top of the draw pile until the hand holds handSize cards.
 * Draws nothing if the hand already holds that many or more. Never reshuffles:
 * only a rest refills the draw pile.
 */
export function drawUpTo(deck: HeroDeck, rules: DeckRules = defaultDeckRules): HeroDeck {
  const count = Math.max(0, Math.min(rules.handSize - deck.hand.length, deck.drawPile.length))
  return {
    ...deck,
    hand: [...deck.hand, ...deck.drawPile.slice(0, count)],
    drawPile: deck.drawPile.slice(count),
  }
}

/**
 * Play a card from the hand.
 * - A shield half goes face-up to the showing pile (even if it is also a Burn half).
 * - Otherwise a Burn half sends the card to the lost pile.
 * - Anything else, including a generic play, goes to the discard pile.
 */
export function playCard(deck: HeroDeck, card: CardDefinition, use: CardUse): HeroDeck {
  const hand = removeOne(deck.hand, card.id, 'hand')
  if (use === 'generic') {
    return { ...deck, hand, discard: [...deck.discard, card.id] }
  }
  const half = use === 'A' ? card.halfA : card.halfB
  if (half.shield !== undefined) {
    const shield: ShowingShield = { cardId: card.id, value: half.shield, burned: half.burn }
    return { ...deck, hand, showing: [...deck.showing, shield] }
  }
  if (half.burn) {
    return { ...deck, hand, lost: [...deck.lost, card.id] }
  }
  return { ...deck, hand, discard: [...deck.discard, card.id] }
}

/** After the monster phase resolves: burned shields go to the lost pile, the rest to the discard pile. */
export function clearShowing(deck: HeroDeck): HeroDeck {
  return {
    ...deck,
    showing: [],
    discard: [...deck.discard, ...deck.showing.filter((s) => !s.burned).map((s) => s.cardId)],
    lost: [...deck.lost, ...deck.showing.filter((s) => s.burned).map((s) => s.cardId)],
  }
}

export function canRest(deck: HeroDeck, rules: DeckRules = defaultDeckRules): boolean {
  return deck.discard.length >= rules.minDiscardToRest
}

/**
 * Rest: move the chosen discard card to the lost pile, shuffle the rest of the
 * discard together with the draw pile, then draw up to handSize.
 */
export function rest(
  deck: HeroDeck,
  cardIdToLose: string,
  random: RandomState,
  rules: DeckRules = defaultDeckRules,
  shuffler: Shuffler = shuffle,
): { deck: HeroDeck; random: RandomState } {
  if (!canRest(deck, rules)) {
    throw new Error(
      `Cannot rest: need at least ${rules.minDiscardToRest} cards in the discard pile, have ${deck.discard.length}`,
    )
  }
  const remainingDiscard = removeOne(deck.discard, cardIdToLose, 'discard pile')
  const shuffled = shuffler([...deck.drawPile, ...remainingDiscard], random)
  const rested: HeroDeck = {
    ...deck,
    drawPile: shuffled.items,
    discard: [],
    lost: [...deck.lost, cardIdToLose],
  }
  return { deck: drawUpTo(rested, rules), random: shuffled.state }
}

/** Move chosen cards from the discard pile to the hand (Arcane Recall). The hand may go above handSize. */
export function returnFromDiscard(deck: HeroDeck, cardIds: readonly string[]): HeroDeck {
  if (new Set(cardIds).size !== cardIds.length) {
    throw new Error('Cannot return the same card twice')
  }
  let discard = deck.discard
  for (const id of cardIds) {
    discard = removeOne(discard, id, 'discard pile')
  }
  return { ...deck, discard, hand: [...deck.hand, ...cardIds] }
}

/** Move a chosen card from the hand to the discard pile (Rotting Aura). */
export function discardFromHand(deck: HeroDeck, cardId: string): HeroDeck {
  return {
    ...deck,
    hand: removeOne(deck.hand, cardId, 'hand'),
    discard: [...deck.discard, cardId],
  }
}

/**
 * Exhausted: you cannot play a card and cannot rest. Any card in hand can be
 * played for its generic action, so this means an empty hand and too few
 * cards in the discard pile to rest.
 */
export function isExhausted(deck: HeroDeck, rules: DeckRules = defaultDeckRules): boolean {
  return deck.hand.length === 0 && !canRest(deck, rules)
}

function removeOne(pile: readonly string[], cardId: string, pileName: string): string[] {
  const index = pile.indexOf(cardId)
  if (index === -1) {
    throw new Error(`Card "${cardId}" is not in the ${pileName}`)
  }
  return [...pile.slice(0, index), ...pile.slice(index + 1)]
}
