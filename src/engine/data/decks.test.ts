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
  it('marks the two burn cards from the spec', () => {
    expect(names(warriorDeck, (card) => card.halfA.burn)).toEqual(['Heavy Blow', 'Last Stand'])
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
  it('marks the four burn cards from the spec (Arcane Bolt burns as of v0.7)', () => {
    expect(names(mageDeck, (card) => card.halfA.burn).sort()).toEqual(
      ['Arcane Bolt', 'Arcane Recall', 'Barrier', 'Meteor'].sort(),
    )
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

describe('card effects', () => {
  it('give every shield half a shield effect of the same value, and only shield halves', () => {
    for (const card of [...warriorDeck, ...mageDeck]) {
      for (const half of [card.halfA, card.halfB]) {
        const shieldEffects = half.effects.filter((e) => e.kind === 'shield')
        if (half.shield === undefined) {
          expect(shieldEffects, `${card.name}`).toEqual([])
        } else {
          expect(shieldEffects, `${card.name}`).toEqual([{ kind: 'shield', value: half.shield }])
        }
      }
    }
  })
})
