// Scenario 1 enemy deck from docs/rules-spec.md section 7.

/** Which monsters act when the card is flipped. */
export type EnemyActors =
  | 'all'
  | 'adjacent' // monsters adjacent to you
  | 'melee' // melee monsters
  | 'closest' // the closest monster
  | 'none'

export interface EnemyCardDefinition {
  readonly id: string
  readonly name: string
  /** Copies of this card in the deck. */
  readonly count: number
  readonly text: string
  readonly actors: EnemyActors
  /** Added to each acting monster's Move. */
  readonly moveBonus: number
  /** Added to each acting monster's attack. 'campaignTier' means "+X, where X is the campaign tier". */
  readonly attackBonus: number | 'campaignTier'
  /** Attacks each acting monster makes. */
  readonly attacks: number
  /** Toxic Fumes: you take damage if you stand on Mud. */
  readonly mudDamage?: boolean
  /** Unleash Doom: after the card resolves, shuffle the whole deck back together. */
  readonly reshuffle?: boolean
}

export const enemyDeck: readonly EnemyCardDefinition[] = [
  {
    id: 'advance',
    name: 'The Advance',
    count: 4,
    text: 'All monsters: Move +1, Attack +0',
    actors: 'all',
    moveBonus: 1,
    attackBonus: 0,
    attacks: 1,
  },
  {
    id: 'skirmish',
    name: 'The Skirmish',
    count: 4,
    text: 'Monsters adjacent to you: Attack +1. Other monsters do nothing.',
    actors: 'adjacent',
    moveBonus: 0,
    attackBonus: 1,
    attacks: 1,
  },
  {
    id: 'flanked',
    name: 'Flanked!',
    count: 1,
    text: 'All monsters: Move toward you, Attack +0',
    actors: 'all',
    moveBonus: 0,
    attackBonus: 0,
    attacks: 1,
  },
  {
    id: 'enrage',
    name: 'Enrage',
    count: 1,
    text: 'Melee monsters: Move +2, Attack +0',
    actors: 'melee',
    moveBonus: 2,
    attackBonus: 0,
    attacks: 1,
  },
  {
    id: 'frenzy',
    name: 'Frenzy',
    count: 1,
    text: 'The closest monster: Attack twice',
    actors: 'closest',
    moveBonus: 0,
    attackBonus: 0,
    attacks: 2,
  },
  {
    id: 'toxic-fumes',
    name: 'Toxic Fumes',
    count: 1,
    text: 'Monsters do not move. If you stand on Mud, take 1 damage. Shields do not reduce it.',
    actors: 'none',
    moveBonus: 0,
    attackBonus: 0,
    attacks: 0,
    mudDamage: true,
  },
  {
    id: 'unleash-doom',
    name: 'Unleash Doom',
    count: 2,
    text: 'All monsters: Attack +X, where X is the campaign tier. Then reshuffle the enemy deck.',
    actors: 'all',
    moveBonus: 0,
    attackBonus: 'campaignTier',
    attacks: 1,
    reshuffle: true,
  },
  {
    id: 'regroup',
    name: 'Regroup',
    count: 1,
    text: 'Monsters do not move or attack this round.',
    actors: 'none',
    moveBonus: 0,
    attackBonus: 0,
    attacks: 0,
  },
]
