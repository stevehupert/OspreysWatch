// A "flip-blind" bot that plays a hero through Scenario 1.
//
// It sees the whole board and knows how many of each enemy card are left in the enemy deck,
// but not their order, and it cannot see what a Rest will shuffle. For each play it tries the
// candidates, imagines the monster phase that follows (averaged over the enemy cards still in
// the deck), scores the resulting position, and takes the best. It is a stand-in for a decent
// human player, used to check balance. It is not a perfect player.

import type { CardDefinition } from './data/cardTypes.ts'
import type { Pos } from './data/scenarioTypes.ts'
import { candidateActions } from './botCandidates.ts'
import {
  actingMonsters,
  aliveMonsters,
  targetableMonsters,
  type GameContext,
  type GameState,
} from './gameState.ts'
import { manhattan, neighbours, posKey, shortestPaths, terrainAt } from './grid.ts'
import { performAction, type HeroAction } from './heroActions.ts'
import { runMonsterPhase } from './monsterPhase.ts'
import { endRound, roarApplies } from './round.ts'

/** How much the bot cares about each thing when it scores a position. Tuned by playing many games. */
export interface BotWeights {
  /** Per point of monster health left. */
  readonly monsterHealth: number
  /** Per monster still alive (so finishing a monster beats chipping two). */
  readonly monsterAlive: number
  /** Per point of its own health. */
  readonly health: number
  /** Per space of distance to the door, then the chest. */
  readonly objective: number
  /** Per space away from the preferred fighting distance. */
  readonly engagement: number
  /** For standing where a push would send the Ogre into Lava. */
  readonly lavaSetup: number
  /** For each card not yet lost. */
  readonly card: number
  /** Per point of card value, for the cards not yet lost. */
  readonly cardValue: number
  readonly doorOpen: number
  readonly looted: number
  /** Subtracted from a play that changes nothing on the board. */
  readonly wastedPlay: number
}

export const defaultBotWeights: BotWeights = {
  monsterHealth: 4,
  monsterAlive: 8,
  health: 2.2,
  objective: 0.6,
  engagement: 1.5,
  lavaSetup: 12,
  card: 1,
  cardValue: 0.25,
  doorOpen: 6,
  looted: 10,
  wastedPlay: 6,
}

const WIN = 1e6

/** Rough worth of a card, used to decide what to keep and what to throw away to Roar. */
function halfValue(half: CardDefinition['halfA']): number {
  let value = 0
  for (const effect of half.effects) {
    if (effect.kind === 'attack') value += 2 * effect.damage
    else if (effect.kind === 'shield') value += 1.5 * effect.value
    else if (effect.kind === 'heal') value += effect.amount
    else if (effect.kind === 'move') value += 0.7 * effect.distance
    else if (effect.kind === 'push') value += 3
    else if (effect.kind === 'returnCards') value += 4
  }
  return value
}

const cardValueCache = new WeakMap<CardDefinition, number>()
function cardValue(card: CardDefinition): number {
  let value = cardValueCache.get(card)
  if (value === undefined) {
    const a = halfValue(card.halfA)
    const b = halfValue(card.halfB)
    value = Math.max(a, b) + 0.3 * Math.min(a, b)
    cardValueCache.set(card, value)
  }
  return value
}

function valueOfId(context: GameContext, id: string): number {
  const card = context.cardsById.get(id)
  return card ? cardValue(card) : 0
}

/** Distance to the door (while it is shut) or to the chest, ignoring monsters, since they can be killed. */
function objectiveDistance(context: GameContext, state: GameState): number {
  if (state.looted) return 0
  const paths = shortestPaths(
    context.board,
    state.position,
    (pos) => {
      const terrain = terrainAt(context.board, pos)
      return terrain === 'floor' || terrain === 'mud' || terrain === 'door'
    },
    state.doorOpen,
    context.rules.mudCost,
  )
  if (!state.doorOpen) return (paths.cost.get(posKey(context.scenario.door)) ?? 99) + 8
  const sides = neighbours(context.scenario.chest).flatMap((p) => paths.cost.get(posKey(p)) ?? [])
  return sides.length > 0 ? Math.min(...sides) : 99
}

/** Would a push from where the hero stands send the Ogre into Lava? (A Warrior pushes 1, a Mage up to 3.) */
function lavaSetup(context: GameContext, state: GameState): boolean {
  const ogre = targetableMonsters(state).find((m) => m.kind === 'ogre')
  if (!ogre) return false
  const reach = state.heroId === 'warrior' ? 1 : 3
  for (const space of context.scenario.spaces) {
    if (space.terrain !== 'lava' || manhattan(space.at, ogre.pos) !== 1) continue
    const away: Pos = { row: space.at.row - ogre.pos.row, col: space.at.col - ogre.pos.col }
    for (let k = 1; k <= reach; k++) {
      if (
        ogre.pos.row - k * away.row === state.position.row &&
        ogre.pos.col - k * away.col === state.position.col
      ) {
        return true
      }
    }
  }
  return false
}

/** Score a position. Higher is better. A win or a loss counts for far more than anything else. */
export function evaluate(
  context: GameContext,
  state: GameState,
  weights: BotWeights = defaultBotWeights,
): number {
  if (state.result) return state.result === 'victory' ? WIN : -WIN

  const deck = state.deck
  const kept = [
    ...deck.hand,
    ...deck.drawPile,
    ...deck.discard,
    ...deck.showing.map((s) => s.cardId),
  ]
  const monsterHealth = state.monsters.reduce((sum, m) => sum + Math.max(m.health, 0), 0)
  const visible = targetableMonsters(state)

  let engagement = 0
  if (visible.length > 0) {
    const nearest = Math.min(...visible.map((m) => manhattan(state.position, m.pos)))
    engagement =
      state.heroId === 'warrior'
        ? -weights.engagement * Math.max(nearest - 1, 0)
        : -weights.engagement * Math.abs(nearest - 3)
  }
  const objective =
    visible.length === 0
      ? objectiveDistance(context, state)
      : 0.3 * objectiveDistance(context, state)

  return (
    -weights.monsterHealth * monsterHealth -
    weights.monsterAlive * aliveMonsters(state).length -
    weights.objective * objective +
    weights.health * state.health +
    weights.card * kept.length +
    engagement +
    (lavaSetup(context, state) ? weights.lavaSetup : 0) +
    (state.doorOpen ? weights.doorOpen : 0) +
    (state.looted ? weights.looted : 0) +
    weights.cardValue * kept.reduce((sum, id) => sum + valueOfId(context, id), 0)
  )
}

/** How many of each enemy card are still to come. The order is not known. */
function remainingEnemyCards(state: GameState): Map<string, number> {
  const pile =
    state.enemyDeck.drawPile.length > 0 ? state.enemyDeck.drawPile : state.enemyDeck.discard
  const counts = new Map<string, number>()
  for (const id of pile) counts.set(id, (counts.get(id) ?? 0) + 1)
  return counts
}

/** The average score after the next monster phase, over the enemy cards that could be flipped. */
function expectedScore(context: GameContext, state: GameState, weights: BotWeights): number {
  if (state.result || actingMonsters(state).length === 0) return evaluate(context, state, weights)
  let total = 0
  let cards = 0
  for (const [id, count] of remainingEnemyCards(state)) {
    total += count * evaluate(context, runMonsterPhase(context, state, id), weights)
    cards += count
  }
  return total / cards
}

/** What changed on the board, so a play that changes nothing can be marked down. */
function boardSignature(state: GameState): string {
  const monsters = state.monsters
    .map((m) => `${m.id}:${m.pos.row},${m.pos.col}:${m.health}:${m.frozen ? 1 : 0}`)
    .join(';')
  const shields = state.deck.showing
    .map((s) => `${s.cardId}=${s.value}`)
    .sort()
    .join(',')
  return `${state.position.row},${state.position.col}|${state.health}|${state.looted}|${state.doorOpen}|${shields}|${monsters}`
}

/** When Roar makes the bot discard, it throws away the least valuable card in hand. */
export function chooseRoarDiscard(context: GameContext, state: GameState): string | undefined {
  if (!roarApplies(context, state)) return undefined
  let best: string | undefined
  let bestValue = Infinity
  for (const id of state.deck.hand) {
    const value = valueOfId(context, id)
    if (value < bestValue) {
      best = id
      bestValue = value
    }
  }
  return best
}

/**
 * Pick the next play or rest. `restedThisRound` stops the bot from resting twice in a round.
 * Returns undefined only if there is nothing to do.
 */
export function chooseAction(
  context: GameContext,
  state: GameState,
  weights: BotWeights = defaultBotWeights,
): HeroAction | undefined {
  const before = boardSignature(state)
  const firstPlay = state.playsDone === 0
  let best: HeroAction | undefined
  let bestScore = -Infinity

  for (const action of candidateActions(context, state)) {
    if (action.type === 'rest' && state.restsThisRound > 0) continue
    const performed = performAction(context, state, action)
    if (!performed.ok) continue
    const after = performed.state

    let score: number
    if (after.result) {
      score = evaluate(context, after, weights)
    } else if (firstPlay) {
      score = expectedScore(context, after, weights)
    } else {
      const next = endRound(context, after, chooseRoarDiscard(context, after))
      score = 0.5 * evaluate(context, next, weights) + 0.5 * expectedScore(context, next, weights)
    }
    if (action.type !== 'rest' && !after.result && boardSignature(after) === before) {
      score -= weights.wastedPlay
    }
    if (score > bestScore) {
      best = action
      bestScore = score
    }
  }
  return best
}
