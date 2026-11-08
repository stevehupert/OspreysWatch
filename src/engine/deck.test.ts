import { describe, expect, it } from 'vitest'
import type { CardDefinition } from './data/cardTypes.ts'
import { warriorDeck } from './data/warriorDeck.ts'
import {
  canRest,
  clearShowing,
  createDeck,
  discardFromHand,
  drawUpTo,
  isExhausted,
  playCard,
  rest,
  returnFromDiscard,
  type HeroDeck,
} from './deck.ts'
import { createRandom } from './random.ts'

function card(id: string): CardDefinition {
  const found = warriorDeck.find((c) => c.id === id)
  if (!found) throw new Error(`No test card ${id}`)
  return found
}

/** Build a deck with specific piles, for testing one rule at a time. */
function deckWith(piles: Partial<HeroDeck>): HeroDeck {
  return { drawPile: [], hand: [], discard: [], showing: [], lost: [], ...piles }
}

function allCards(deck: HeroDeck): string[] {
  return [
    ...deck.drawPile,
    ...deck.hand,
    ...deck.discard,
    ...deck.showing.map((s) => s.cardId),
    ...deck.lost,
  ].sort()
}

const allWarriorIds = warriorDeck.map((c) => c.id).sort()

describe('createDeck', () => {
  it('draws a starting hand of 5 and leaves 5 in the draw pile', () => {
    const { deck } = createDeck(warriorDeck, createRandom(1))
    expect(deck.hand).toHaveLength(5)
    expect(deck.drawPile).toHaveLength(5)
    expect(deck.discard).toEqual([])
    expect(deck.showing).toEqual([])
    expect(deck.lost).toEqual([])
    expect(allCards(deck)).toEqual(allWarriorIds)
  })

  it('gives the same deck for the same seed', () => {
    expect(createDeck(warriorDeck, createRandom(8))).toEqual(
      createDeck(warriorDeck, createRandom(8)),
    )
  })

  it('gives different starting orders for different seeds', () => {
    const orders = new Set(
      [1, 2, 3, 4, 5].map((seed) => createDeck(warriorDeck, createRandom(seed)).deck.hand.join()),
    )
    expect(orders.size).toBeGreaterThan(1)
  })

  it('rejects a deck with a duplicated card id', () => {
    expect(() => createDeck([warriorDeck[0], warriorDeck[0]], createRandom(1))).toThrow()
  })
})

describe('drawUpTo', () => {
  it('draws from the top until the hand holds 5', () => {
    const deck = deckWith({ hand: ['h1', 'h2'], drawPile: ['d1', 'd2', 'd3', 'd4'] })
    expect(drawUpTo(deck)).toEqual(
      deckWith({ hand: ['h1', 'h2', 'd1', 'd2', 'd3'], drawPile: ['d4'] }),
    )
  })

  it('draws nothing when the hand already holds 5 or more', () => {
    const deck = deckWith({ hand: ['1', '2', '3', '4', '5', '6'], drawPile: ['d1'] })
    expect(drawUpTo(deck)).toEqual(deck)
  })

  it('stops when the draw pile runs out and does not reshuffle the discard', () => {
    const deck = deckWith({ hand: ['h1'], drawPile: ['d1'], discard: ['x1', 'x2'] })
    expect(drawUpTo(deck)).toEqual(
      deckWith({ hand: ['h1', 'd1'], drawPile: [], discard: ['x1', 'x2'] }),
    )
  })
})

describe('playCard', () => {
  it('sends a normal half to the discard pile', () => {
    const deck = deckWith({ hand: ['warrior-quick-strike', 'warrior-sweep'] })
    const played = playCard(deck, card('warrior-quick-strike'), 'A')
    expect(played.hand).toEqual(['warrior-sweep'])
    expect(played.discard).toEqual(['warrior-quick-strike'])
  })

  it('sends a Burn half to the lost pile', () => {
    const played = playCard(
      deckWith({ hand: ['warrior-heavy-blow'] }),
      card('warrior-heavy-blow'),
      'A',
    )
    expect(played.lost).toEqual(['warrior-heavy-blow'])
    expect(played.discard).toEqual([])
  })

  it('sends the non-burn half of a burn card to the discard pile', () => {
    const played = playCard(
      deckWith({ hand: ['warrior-heavy-blow'] }),
      card('warrior-heavy-blow'),
      'B',
    )
    expect(played.discard).toEqual(['warrior-heavy-blow'])
    expect(played.lost).toEqual([])
  })

  it('never burns a card played for its generic action', () => {
    const played = playCard(
      deckWith({ hand: ['warrior-heavy-blow'] }),
      card('warrior-heavy-blow'),
      'generic',
    )
    expect(played.discard).toEqual(['warrior-heavy-blow'])
    expect(played.lost).toEqual([])
  })

  it('puts a shield half face-up in the showing pile', () => {
    const played = playCard(
      deckWith({ hand: ['warrior-shield-bash'] }),
      card('warrior-shield-bash'),
      'B',
    )
    expect(played.showing).toEqual([{ cardId: 'warrior-shield-bash', value: 2, burned: false }])
    expect(played.discard).toEqual([])
  })

  it('puts a burned shield half (Last Stand A) in the showing pile, marked as burned', () => {
    const played = playCard(
      deckWith({ hand: ['warrior-last-stand'] }),
      card('warrior-last-stand'),
      'A',
    )
    expect(played.showing).toEqual([{ cardId: 'warrior-last-stand', value: 2, burned: true }])
    expect(played.lost).toEqual([])
  })

  it('rejects a card that is not in the hand', () => {
    expect(() => playCard(deckWith({ hand: [] }), card('warrior-sweep'), 'A')).toThrow(
      /not in the hand/,
    )
  })

  it('does not change the deck it was given', () => {
    const deck = deckWith({ hand: ['warrior-sweep'] })
    const copy = structuredClone(deck)
    playCard(deck, card('warrior-sweep'), 'A')
    expect(deck).toEqual(copy)
  })
})

describe('clearShowing', () => {
  it('sends shields to the discard pile and burned shields to the lost pile', () => {
    const deck = deckWith({
      showing: [
        { cardId: 'warrior-shield-bash', value: 2, burned: false },
        { cardId: 'warrior-last-stand', value: 2, burned: true },
      ],
    })
    expect(clearShowing(deck)).toEqual(
      deckWith({ discard: ['warrior-shield-bash'], lost: ['warrior-last-stand'] }),
    )
  })
})

describe('canRest and rest', () => {
  it('needs at least 2 cards in the discard pile', () => {
    expect(canRest(deckWith({ discard: ['a'] }))).toBe(false)
    expect(canRest(deckWith({ discard: ['a', 'b'] }))).toBe(true)
    expect(() => rest(deckWith({ discard: ['a'] }), 'a', createRandom(1))).toThrow(/Cannot rest/)
  })

  it('rejects losing a card that is not in the discard pile', () => {
    expect(() =>
      rest(deckWith({ discard: ['a', 'b'], hand: ['c'] }), 'c', createRandom(1)),
    ).toThrow(/not in the discard pile/)
  })

  it('loses the chosen card, shuffles the discard together with the draw pile, and draws up to 5', () => {
    const deck = deckWith({
      hand: ['h1'],
      drawPile: ['d1', 'd2'],
      discard: ['x1', 'x2', 'x3', 'x4', 'x5'],
      lost: ['old-lost'],
    })
    const { deck: rested } = rest(deck, 'x3', createRandom(4))
    expect(rested.lost).toEqual(['old-lost', 'x3'])
    expect(rested.discard).toEqual([])
    expect(rested.hand).toHaveLength(5)
    expect(rested.hand[0]).toBe('h1')
    expect(rested.drawPile).toHaveLength(2)
    // The draw pile and the remaining discard were combined: all 6 are now in the hand or draw pile.
    expect([...rested.hand.slice(1), ...rested.drawPile].sort()).toEqual(
      ['d1', 'd2', 'x1', 'x2', 'x4', 'x5'].sort(),
    )
  })

  it('is repeatable for the same seed', () => {
    const deck = deckWith({ discard: ['a', 'b', 'c', 'd'] })
    expect(rest(deck, 'a', createRandom(9))).toEqual(rest(deck, 'a', createRandom(9)))
  })

  it('leaves showing shields where they are', () => {
    const shield = { cardId: 's', value: 2, burned: false }
    const { deck } = rest(
      deckWith({ discard: ['a', 'b'], showing: [shield] }),
      'a',
      createRandom(1),
    )
    expect(deck.showing).toEqual([shield])
  })
})

describe('returnFromDiscard', () => {
  it('moves the chosen cards to the hand, even above 5', () => {
    const deck = deckWith({ hand: ['1', '2', '3', '4', '5'], discard: ['a', 'b', 'c'] })
    const returned = returnFromDiscard(deck, ['a', 'c'])
    expect(returned.hand).toEqual(['1', '2', '3', '4', '5', 'a', 'c'])
    expect(returned.discard).toEqual(['b'])
  })

  it('rejects cards that are not in the discard pile, or the same card twice', () => {
    const deck = deckWith({ discard: ['a', 'b'] })
    expect(() => returnFromDiscard(deck, ['z'])).toThrow(/not in the discard pile/)
    expect(() => returnFromDiscard(deck, ['a', 'a'])).toThrow()
  })
})

describe('discardFromHand', () => {
  it('moves the chosen card from the hand to the discard pile', () => {
    const discarded = discardFromHand(deckWith({ hand: ['a', 'b'] }), 'b')
    expect(discarded).toEqual(deckWith({ hand: ['a'], discard: ['b'] }))
  })

  it('rejects a card that is not in the hand', () => {
    expect(() => discardFromHand(deckWith({ hand: ['a'] }), 'z')).toThrow(/not in the hand/)
  })
})

describe('isExhausted', () => {
  it('is true only with an empty hand and too few cards to rest', () => {
    expect(isExhausted(deckWith({ hand: [], discard: ['a'] }))).toBe(true)
    expect(isExhausted(deckWith({ hand: [], discard: ['a', 'b'] }))).toBe(false)
    expect(isExhausted(deckWith({ hand: ['a'], discard: [] }))).toBe(false)
  })
})

describe('a full sequence of plays', () => {
  it('never gains or loses a card across piles', () => {
    let { deck, random } = createDeck(warriorDeck, createRandom(123))
    for (let round = 0; round < 6; round++) {
      for (let play = 0; play < 2; play++) {
        if (deck.hand.length > 0) {
          deck = playCard(deck, card(deck.hand[0]), 'A')
        } else if (canRest(deck)) {
          ;({ deck, random } = rest(deck, deck.discard[0], random))
        }
        expect(allCards(deck)).toEqual(allWarriorIds)
      }
      deck = drawUpTo(clearShowing(deck))
      expect(allCards(deck)).toEqual(allWarriorIds)
    }
  })
})
