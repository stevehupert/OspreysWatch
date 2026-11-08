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
}

export const scenarioRules: ScenarioRules = {
  campaignTier: 1,
  enemyDeckSize: 15,
  toxicFumesDamage: 1,
}
