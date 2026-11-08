import { describe, expect, it } from 'vitest'
import {
  applyDamage,
  applyHeal,
  damageToHero,
  damageToMonster,
  heroShield,
  isOut,
} from './combat.ts'
import { heroStats } from './data/heroes.ts'
import { monsterStats } from './data/monsters.ts'

const shield = (value: number, burned = false) => ({ cardId: `card-${value}`, value, burned })

describe('heroShield', () => {
  it('is the base shield when no shield card is showing', () => {
    expect(heroShield(heroStats.warrior.baseShield, [])).toBe(1)
  })

  it('adds the base shield to a showing shield card (Hold the Line gives the Warrior 3)', () => {
    expect(heroShield(heroStats.warrior.baseShield, [shield(2)])).toBe(3)
  })

  it('uses only the highest showing card; cards never add together (Ward + Barrier gives the Mage 4)', () => {
    expect(heroShield(heroStats.mage.baseShield, [shield(2), shield(3)])).toBe(4)
    expect(heroShield(heroStats.mage.baseShield, [shield(3), shield(2)])).toBe(4)
  })
})

describe('damageToHero', () => {
  it('is attack + card modifier + bonus, minus shield', () => {
    // A goblin with Pack Tactics on The Skirmish against shield 1: 2 + 1 + 1 - 1 = 3.
    expect(damageToHero({ attack: monsterStats.goblin.attack, cardModifier: 1, bonus: 1 }, 1)).toBe(
      3,
    )
  })

  it('treats a missing modifier or bonus as 0', () => {
    expect(damageToHero({ attack: 4 }, 1)).toBe(3)
  })

  it('never goes below 0', () => {
    expect(damageToHero({ attack: 2 }, 3)).toBe(0)
  })

  it('reduces each of two Frenzy hits separately', () => {
    const perHit = damageToHero({ attack: monsterStats.shadowLord.attack }, 2)
    expect(perHit).toBe(2)
    expect(applyDamage(applyDamage(10, perHit), perHit)).toBe(6)
  })
})

describe('damageToMonster', () => {
  it('is attack minus armor, never below 0', () => {
    expect(damageToMonster(5, monsterStats.shadowLord.armor)).toBe(4)
    expect(damageToMonster(3, monsterStats.goblin.armor)).toBe(3)
    expect(damageToMonster(1, 2)).toBe(0)
  })
})

describe('applyDamage', () => {
  it('lowers health, never below 0', () => {
    expect(applyDamage(8, 3)).toBe(5)
    expect(applyDamage(2, 5)).toBe(0)
  })

  it('applies damage that ignores shields directly (Toxic Fumes)', () => {
    expect(applyDamage(5, 1)).toBe(4)
  })

  it('rejects negative damage', () => {
    expect(() => applyDamage(5, -1)).toThrow()
  })
})

describe('applyHeal', () => {
  it('raises health, never above maximum', () => {
    expect(applyHeal(4, 3, heroStats.warrior.maxHealth)).toBe(7)
    expect(applyHeal(8, 3, heroStats.warrior.maxHealth)).toBe(10)
  })

  it('rejects a negative heal', () => {
    expect(() => applyHeal(5, -1, 10)).toThrow()
  })
})

describe('isOut', () => {
  it('is true at 0 health only', () => {
    expect(isOut(0)).toBe(true)
    expect(isOut(1)).toBe(false)
  })
})
