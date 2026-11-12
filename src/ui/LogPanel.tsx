// The game log: what happened each round, newest round first. Only the newest round starts open.

import type { GameContext } from '../engine/gameState.ts'
import type { LogRound } from './gameLog.ts'
import { describeEvents } from './logText.ts'

interface LogPanelProps {
  readonly context: GameContext
  readonly log: readonly LogRound[]
}

export function LogPanel({ context, log }: LogPanelProps) {
  const newestFirst = [...log].reverse()
  return (
    <section className="panel log" aria-label="Game log">
      <h2>Log</h2>
      {newestFirst.length === 0 ? (
        <p className="empty">Nothing has happened yet.</p>
      ) : (
        newestFirst.map(({ round, events }, index) => (
          <details key={round} open={index === 0}>
            <summary>Round {round}</summary>
            <ol>
              {describeEvents(context, events).map((line, i) => (
                <li key={i} className={`line-${line.kind}`}>
                  {line.text}
                </li>
              ))}
            </ol>
          </details>
        ))
      )}
    </section>
  )
}
