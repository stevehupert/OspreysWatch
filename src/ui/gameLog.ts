// The game log as the UI keeps it: the engine's events, grouped by the round they happened in.
// It lives beside the game state, not inside it, so saving or replaying a game is unaffected.

import type { GameEvent } from '../engine/events.ts'

export interface LogRound {
  readonly round: number
  readonly events: readonly GameEvent[]
}

/** Add the events of one action, which started in `round`. */
export function addToLog(
  log: readonly LogRound[],
  round: number,
  events: readonly GameEvent[],
): LogRound[] {
  if (events.length === 0) return [...log]
  const last = log.at(-1)
  if (last && last.round === round) {
    return [...log.slice(0, -1), { round, events: [...last.events, ...events] }]
  }
  return [...log, { round, events }]
}

/** The id of the enemy card flipped most recently, if any. */
export function lastEnemyCard(log: readonly LogRound[]): string | undefined {
  for (let r = log.length - 1; r >= 0; r--) {
    const events = log[r].events
    for (let e = events.length - 1; e >= 0; e--) {
      const event = events[e]
      if (event.kind === 'enemyCardFlipped') return event.card
    }
  }
  return undefined
}
