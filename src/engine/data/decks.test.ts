import { describe, expect, it } from 'vitest'
import type { CardDefinition } from './cardTypes.ts'
import { mageDeck } from './mageDeck.ts'
import { warriorDeck } from './warriorDeck.ts'

function names(deck: readonly CardDefinition[], filter: (card: CardDefinition) => boolean) {
  return deck.filter(filter).map((card) => card.name)
}

describe.each([
  ['Warrior', warriorDeck],
  ['Mage', mageDeck],
])('%s deck data', (_hero, deck) => {
  it('has 10 cards with unique ids and names', () => {
    expect(deck).toHaveLength(10)
    expect(new Set(deck.map((card) => card.id)).size).toBe(10)
    expect(new Set(deck.map((card) => card.name)).size).toBe(10)
  })

  it('has Burn only on half A', () => {
    expect(deck.every((card) => !card.halfB.burn)).toBe(true)
  })
})

describe('Warrior deck data', () => {
  it('marks the three burn cards from the spec', () => {
    expect(names(warriorDeck, (card) => card.halfA.burn)).toEqual([
      'Charge',
      'Heavy Blow',
      'Last Stand',
    ])
  })

  it('has the shield halves from the spec', () => {
    const shields = warriorDeck.flatMap((card) =>
      [card.halfA, card.halfB]
        .filter((half) => half.shield)
        .map((half) => [card.name, half.shield]),
    )
    expect(shields).toEqual([
      ['Shield Bash', 2],
      ['Hold the Line', 2],
      ['Guard Stance', 1],
      ['Last Stand', 2],
    ])
  })
})

describe('Mage deck data', () => {
  it('marks the three burn cards from the spec', () => {
    expect(names(mageDeck, (card) => card.halfA.burn)).toEqual([
      'Meteor',
      'Arcane Recall',
      'Barrier',
    ])
  })

  it('has four shield-capable cards, as in spec open question 2', () => {
    const shields = mageDeck.flatMap((card) =>
      [card.halfA, card.halfB]
        .filter((half) => half.shield)
        .map((half) => [card.name, half.shield]),
    )
    expect(shields).toEqual([
      ['Arcane Bolt', 2],
      ['Force Push', 2],
      ['Ward', 2],
      ['Barrier', 3],
    ])
  })
})
