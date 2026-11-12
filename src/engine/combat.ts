// Damage, shields, and healing (rules-spec section 6). Plain numbers in, numbers out.

import type { ShowingShield } from './deck.ts'

/**
 * Your shield. The base shield counts as a showing shield, so it is a floor: you get the higher of the base
 * shield and the best showing shield card. Shield cards never add to each other, and never add to the base.
 */
export function heroShield(baseShield: number, showing: readonly ShowingShield[]): number {
  return showing.reduce((highest, shield) => Math.max(highest, shield.value), baseShield)
}

export interface MonsterHit {
  /** The monster's attack stat. */
  readonly attack: number
  /** The enemy card's attack modifier. */
  readonly cardModifier?: number
  /** Other bonuses, such as Pack Tactics. */
  readonly bonus?: number
}

/**
 * Damage one monster attack deals to a hero: (attack + card modifier + bonus) minus shield,
 * never below 0. A card with two attacks (Frenzy) is two separate hits, each reduced by the shield.
 */
export function damageToHero(hit: MonsterHit, shield: number): number {
  const total = hit.attack + (hit.cardModifier ?? 0) + (hit.bonus ?? 0)
  return Math.max(0, total - shield)
}

/** Damage a hero's attack deals to a monster: attack minus armor, never below 0. */
export function damageToMonster(attack: number, armor: number): number {
  return Math.max(0, attack - armor)
}

/**
 * Lower health by an amount of damage that has already been worked out, never below 0.
 * Damage that ignores shields (Toxic Fumes, Lava) is passed straight to this.
 */
export function applyDamage(health: number, damage: number): number {
  if (damage < 0) {
    throw new Error(`Damage cannot be negative, got ${damage}`)
  }
  return Math.max(0, health - damage)
}

/** Raise health by a heal, never above maximum health. */
export function applyHeal(health: number, amount: number, maxHealth: number): number {
  if (amount < 0) {
    throw new Error(`Heal cannot be negative, got ${amount}`)
  }
  return Math.min(maxHealth, health + amount)
}

/** A hero (or monster) at 0 health is out. */
export function isOut(health: number): boolean {
  return health <= 0
}
