// Rule numbers from docs/rules-spec.md section 10. Logic must read them from here, never hard-code them.

export interface DeckRules {
  /** Cards drawn back up to at the end of a round and after a rest. */
  readonly handSize: number
  /** Cards needed in the discard pile before a rest is allowed. */
  readonly minDiscardToRest: number
}

export interface RoundRules {
  readonly playsPerRound: number
  readonly maxRestsPerRound: number
}

export const deckRules: DeckRules = {
  handSize: 5,
  minDiscardToRest: 2,
}

export const roundRules: RoundRules = {
  playsPerRound: 2,
  maxRestsPerRound: 1,
}

export interface ScenarioRules {
  /** The X in Unleash Doom's "Attack +X". */
  readonly campaignTier: number
  /** Cards in the Scenario 1 enemy deck. */
  readonly enemyDeckSize: number
  /** Damage from Toxic Fumes when you stand on Mud. Not reduced by shields. */
  readonly toxicFumesDamage: number
  /** The Ogre's Frightening Roar reaches heroes within this many spaces. */
  readonly roarRange: number
  /** Damage when something is pushed into Lava. Ignores shield and armor. */
  readonly lavaDamage: number
  /** Movement points it costs to enter a Mud space. */
  readonly mudCost: number
  /** Health restored by the potion in the chest. */
  readonly chestPotionHeal: number
  /** Pack Tactics: extra attack for a Goblin when another Goblin is also adjacent to you. Does not stack. */
  readonly packTacticsBonus: number
  /** Damage a pushed monster takes when the push is blocked (wall, Rubble, chest, closed door, another creature). */
  readonly blockedPushDamage: number
  /**
   * How the door opens. 'step': moving onto the door space opens it and ends the move (rules-spec section 9).
   * 'interact': a play used as Interact, from a space next to the door, opens it (the repo spec's earlier wording).
   * Undecided, so it is a setting; the reference games use 'step'.
   */
  readonly doorOpensBy: 'step' | 'interact'
}

/** What a card does when played "generically" instead of using one of its halves (rules-spec section 2). */
export interface GenericActions {
  readonly moveDistance: number
  readonly attackDamage: number
  readonly attackRange: number
}

export const genericActions: GenericActions = {
  moveDistance: 2,
  attackDamage: 1,
  attackRange: 1,
}

export const scenarioRules: ScenarioRules = {
  campaignTier: 1,
  enemyDeckSize: 15,
  toxicFumesDamage: 1,
  roarRange: 2,
  lavaDamage: 2,
  mudCost: 2,
  chestPotionHeal: 4,
  packTacticsBonus: 1,
  blockedPushDamage: 1,
  doorOpensBy: 'step',
}
