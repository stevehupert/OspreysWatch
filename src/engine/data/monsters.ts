// Monster stats from docs/rules-spec.md section 8. All Scenario 1 monsters are melee.

export interface MonsterStats {
  readonly name: string
  readonly move: number
  readonly attack: number
  readonly armor: number
  readonly health: number
  /** Special ability text. Its effect is implemented in logic later. */
  readonly special: string
}

export const monsterStats = {
  goblin: {
    name: 'Goblin',
    move: 3,
    attack: 2,
    armor: 0,
    health: 4,
    special: 'Pack Tactics: +1 attack if another goblin is adjacent to the target. Does not stack.',
  },
  shadowLord: {
    name: 'Shadow Lord',
    move: 2,
    attack: 4,
    armor: 1,
    health: 10,
    special:
      'Rotting Aura: at end of each round, if you are within 2 spaces, discard 1 card of your choice from your hand.',
  },
} as const satisfies Record<string, MonsterStats>
