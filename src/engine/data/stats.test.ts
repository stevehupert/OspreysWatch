import { describe, expect, it } from 'vitest'
import { scenarioRules } from './config.ts'
import { enemyDeck } from './enemyDeck.ts'
import { heroStats } from './heroes.ts'
import { monsterStats } from './monsters.ts'

describe('enemy deck data', () => {
  it('adds up to exactly the configured deck size (15)', () => {
    const total = enemyDeck.reduce((sum, card) => sum + card.count, 0)
    expect(total).toBe(scenarioRules.enemyDeckSize)
    expect(total).toBe(15)
  })

  it('has the card counts from the spec', () => {
    expect(Object.fromEntries(enemyDeck.map((card) => [card.name, card.count]))).toEqual({
      'The Advance': 4,
      'The Skirmish': 4,
      'Flanked!': 1,
      Enrage: 1,
      Frenzy: 1,
      'Toxic Fumes': 1,
      'Unleash Doom': 2,
      Regroup: 1,
    })
  })

  it('has unique ids', () => {
    expect(new Set(enemyDeck.map((card) => card.id)).size).toBe(enemyDeck.length)
  })

  it('gives Unleash Doom an attack bonus of the campaign tier, and a reshuffle', () => {
    const doom = enemyDeck.find((card) => card.id === 'unleash-doom')
    expect(doom?.attackBonus).toBe('campaignTier')
    expect(doom?.reshuffle).toBe(true)
    expect(enemyDeck.filter((card) => card.reshuffle)).toEqual([doom])
  })

  it('makes monsters do nothing on Toxic Fumes and Regroup', () => {
    for (const id of ['toxic-fumes', 'regroup']) {
      const card = enemyDeck.find((c) => c.id === id)
      expect(card?.actors).toBe('none')
      expect(card?.attacks).toBe(0)
    }
  })
})

describe('hero and monster stats', () => {
  it('match the spec', () => {
    expect(heroStats.warrior).toEqual({ maxHealth: 10, baseShield: 1 })
    expect(heroStats.mage).toEqual({ maxHealth: 8, baseShield: 1 })
    expect(monsterStats.goblin).toMatchObject({ move: 3, attack: 2, armor: 0, health: 4 })
    expect(monsterStats.shadowLord).toMatchObject({ move: 2, attack: 4, armor: 1, health: 10 })
  })
})
