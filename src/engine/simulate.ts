// Play whole games with the bot and summarise how often each hero wins.
// Used to check the balance of a scenario; nothing in the game itself depends on it.

import { chooseAction, chooseRoarDiscard, defaultBotWeights, type BotWeights } from './bot.ts'
import type { HeroId } from './data/heroes.ts'
import { createGame, type GameContext, type GameResult } from './gameState.ts'
import { playAction } from './round.ts'

export type Outcome = GameResult | 'timeout'

export interface GameSummary {
  readonly hero: HeroId
  readonly seed: number
  readonly outcome: Outcome
  /** The round the game ended in. */
  readonly rounds: number
  readonly health: number
  /** The lowest health the hero reached. */
  readonly lowestHealth: number
  readonly rests: number
  readonly cardsLost: number
}

/** A game that is still undecided after this many rounds counts as a timeout. */
export const defaultMaxRounds = 60

export function playBotGame(
  context: GameContext,
  hero: HeroId,
  seed: number,
  weights: BotWeights = defaultBotWeights,
  maxRounds: number = defaultMaxRounds,
): GameSummary {
  let state = createGame(context, hero, seed)
  let lowestHealth = state.health
  let rests = 0

  while (!state.result && state.round <= maxRounds) {
    const action =
      state.phase === 'roar'
        ? {
            type: 'discard' as const,
            card: chooseRoarDiscard(context, state) ?? state.deck.hand[0],
          }
        : chooseAction(context, state, weights)
    if (!action) {
      state = { ...state, result: 'defeat-exhausted', phase: 'over' }
      break
    }
    const result = playAction(context, state, action)
    if (!result.ok) throw new Error(`Bot chose an illegal action: ${result.reason}`)
    if (action.type === 'rest') rests++
    state = result.state
    lowestHealth = Math.min(lowestHealth, state.health)
  }

  return {
    hero,
    seed,
    outcome: state.result ?? 'timeout',
    rounds: state.round,
    health: state.health,
    lowestHealth,
    rests,
    cardsLost: state.deck.lost.length,
  }
}

export interface BatchSummary {
  readonly games: number
  readonly outcomes: Readonly<Record<Outcome, number>>
  readonly winRate: number
  /** Half-width of the 95% confidence interval on the win rate (normal approximation). */
  readonly winRateMargin: number
  readonly averageWinRounds: number
}

export function summarise(results: readonly GameSummary[]): BatchSummary {
  const outcomes: Record<Outcome, number> = {
    victory: 0,
    'defeat-health': 0,
    'defeat-exhausted': 0,
    timeout: 0,
  }
  for (const r of results) outcomes[r.outcome]++
  const games = results.length
  const winRate = games === 0 ? 0 : outcomes.victory / games
  const wins = results.filter((r) => r.outcome === 'victory')
  return {
    games,
    outcomes,
    winRate,
    winRateMargin: games === 0 ? 0 : 1.96 * Math.sqrt((winRate * (1 - winRate)) / games),
    averageWinRounds: wins.length === 0 ? 0 : wins.reduce((s, r) => s + r.rounds, 0) / wins.length,
  }
}
