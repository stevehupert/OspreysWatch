// The state of one game, and the read-only questions the rest of the engine asks about it.
// Every state value is immutable: functions that change a game return a new state.

import { heroShield } from './combat.ts'
import type { CardDefinition } from './data/cardTypes.ts'
import {
  deckRules,
  genericActions,
  roundRules,
  scenarioRules,
  type DeckRules,
  type GenericActions,
  type RoundRules,
  type ScenarioRules,
} from './data/config.ts'
import { enemyDeck as enemyCardDefinitions, type EnemyCardDefinition } from './data/enemyDeck.ts'
import { heroStats, type HeroId } from './data/heroes.ts'
import { mageDeck } from './data/mageDeck.ts'
import { monsterStats, type MonsterKind } from './data/monsters.ts'
import { scenario1 } from './data/scenario1.ts'
import type { Pos, ScenarioDefinition } from './data/scenarioTypes.ts'
import { warriorDeck } from './data/warriorDeck.ts'
import { createDeck, type HeroDeck } from './deck.ts'
import { createEnemyDeck, type EnemyDeck } from './enemyDeck.ts'
import { createBoard, manhattan, samePos, terrainAt, type Board } from './grid.ts'
import { createRandom, shuffle, type RandomState, type Shuffler } from './random.ts'

export interface MonsterState {
  readonly id: string
  readonly kind: MonsterKind
  readonly pos: Pos
  readonly health: number
  /** Hidden monsters (the Ogre behind the door) cannot be targeted until revealed. */
  readonly revealed: boolean
  /** Round in which the monster was revealed. It does not act in that round. */
  readonly revealedOnRound: number | null
  /** Frozen monsters do not move in the next monster phase, but can still attack. */
  readonly frozen: boolean
}

export type GameResult = 'victory' | 'defeat-health' | 'defeat-exhausted'

/** 'play' waits for a card or rest; 'roar' waits for the card to discard to Frightening Roar. */
export type GamePhase = 'play' | 'roar' | 'over'

export interface GameState {
  readonly heroId: HeroId
  readonly health: number
  readonly position: Pos
  readonly deck: HeroDeck
  readonly enemyDeck: EnemyDeck
  readonly monsters: readonly MonsterState[]
  readonly doorOpen: boolean
  readonly looted: boolean
  /** Starts at 1. Goes up when a round ends, so a game won mid-round keeps the round it was won in. */
  readonly round: number
  /** Plays (cards or rests) made so far this round. */
  readonly playsDone: number
  readonly restsThisRound: number
  readonly phase: GamePhase
  readonly result: GameResult | null
  readonly random: RandomState
}

/** Everything about a game that is not state: the rules, the map, the card lists and the shufflers. */
export interface GameContext {
  readonly scenario: ScenarioDefinition
  readonly board: Board
  readonly rules: ScenarioRules
  readonly deckRules: DeckRules
  readonly roundRules: RoundRules
  readonly generic: GenericActions
  readonly heroCards: Readonly<Record<HeroId, readonly CardDefinition[]>>
  readonly cardsById: ReadonlyMap<string, CardDefinition>
  readonly enemyCards: readonly EnemyCardDefinition[]
  /** Shuffles hero decks. Tests replace it to script a reference game. */
  readonly shuffleHero: Shuffler
  /** Shuffles the enemy deck. Tests replace it to script a reference game. */
  readonly shuffleEnemy: Shuffler
}

export interface ContextOptions {
  readonly scenario?: ScenarioDefinition
  readonly rules?: Partial<ScenarioRules>
  readonly shuffleHero?: Shuffler
  readonly shuffleEnemy?: Shuffler
}

export function createContext(options: ContextOptions = {}): GameContext {
  const scenario = options.scenario ?? scenario1
  const heroCards = { warrior: warriorDeck, mage: mageDeck }
  return {
    scenario,
    board: createBoard(scenario),
    rules: { ...scenarioRules, ...options.rules },
    deckRules,
    roundRules,
    generic: genericActions,
    heroCards,
    cardsById: new Map([...warriorDeck, ...mageDeck].map((card) => [card.id, card])),
    enemyCards: enemyCardDefinitions,
    shuffleHero: options.shuffleHero ?? shuffle,
    shuffleEnemy: options.shuffleEnemy ?? shuffle,
  }
}

/** Shuffle both decks, draw the starting hand and put everything on the map. */
export function createGame(context: GameContext, heroId: HeroId, seed: number): GameState {
  const heroDeck = createDeck(
    context.heroCards[heroId],
    createRandom(seed),
    context.deckRules,
    context.shuffleHero,
  )
  const enemy = createEnemyDeck(context.enemyCards, heroDeck.random, context.shuffleEnemy)
  return {
    heroId,
    health: heroStats[heroId].maxHealth,
    position: context.scenario.heroStart,
    deck: heroDeck.deck,
    enemyDeck: enemy.deck,
    monsters: context.scenario.monsters.map((m) => ({
      id: m.id,
      kind: m.kind,
      pos: m.at,
      health: monsterStats[m.kind].health,
      revealed: !m.hidden,
      revealedOnRound: null,
      frozen: false,
    })),
    doorOpen: false,
    looted: false,
    round: 1,
    playsDone: 0,
    restsThisRound: 0,
    phase: 'play',
    result: null,
    random: enemy.random,
  }
}

export const aliveMonsters = (state: GameState): MonsterState[] =>
  state.monsters.filter((m) => m.health > 0)

/** Alive monsters the hero can see and target. */
export const targetableMonsters = (state: GameState): MonsterState[] =>
  state.monsters.filter((m) => m.health > 0 && m.revealed)

export const findMonster = (state: GameState, id: string): MonsterState | undefined =>
  state.monsters.find((m) => m.id === id)

export function replaceMonster(state: GameState, updated: MonsterState): GameState {
  return { ...state, monsters: state.monsters.map((m) => (m.id === updated.id ? updated : m)) }
}

/** Is a space taken by the hero or by an alive monster (hidden ones included)? */
export function isOccupied(state: GameState, pos: Pos, ignoreMonsterId?: string): boolean {
  if (samePos(pos, state.position)) return true
  return state.monsters.some((m) => m.health > 0 && m.id !== ignoreMonsterId && samePos(m.pos, pos))
}

export const currentShield = (state: GameState): number =>
  heroShield(heroStats[state.heroId].baseShield, state.deck.showing)

export const maxHealth = (state: GameState): number => heroStats[state.heroId].maxHealth

/**
 * Monsters that act in a monster phase: alive, revealed, and not revealed this round.
 * Closest to the hero first; ties go to the lowest row, then the lowest column.
 */
export function actingMonsters(state: GameState): MonsterState[] {
  return state.monsters
    .filter((m) => m.health > 0 && m.revealed && m.revealedOnRound !== state.round)
    .sort(
      (a, b) =>
        manhattan(a.pos, state.position) - manhattan(b.pos, state.position) ||
        a.pos.row - b.pos.row ||
        a.pos.col - b.pos.col,
    )
}

/** Win or lose, if the game just ended that way. Call after anything that can change health or monsters. */
export function withResultIfOver(state: GameState): GameState {
  if (state.result) return state
  let result: GameResult | null = null
  if (state.health <= 0) result = 'defeat-health'
  else if (state.looted && aliveMonsters(state).length === 0) result = 'victory'
  return result ? { ...state, result, phase: 'over' } : state
}

export const heroTerrain = (context: GameContext, state: GameState) =>
  terrainAt(context.board, state.position)
