// The end of a game: victory or defeat, the story text, what was earned, and what to do next.
// It sits above the final board, so the board and the log stay visible underneath.

import {
  maxHealth,
  type GameContext,
  type GameResult,
  type GameState,
} from '../engine/gameState.ts'
import { Stat } from './Stat.tsx'

interface EndPanelProps {
  readonly context: GameContext
  readonly state: GameState
  readonly result: GameResult
  readonly seed?: number
  readonly onReplay?: () => void
  readonly onNewGame?: () => void
}

const resultText: Record<GameResult, string> = {
  victory: 'Every monster is dead and the chest is looted.',
  'defeat-health': 'You ran out of health.',
  'defeat-exhausted': 'You ran out of cards (you could neither play nor rest).',
}

export function EndPanel({ context, state, result, seed, onReplay, onNewGame }: EndPanelProps) {
  const won = result === 'victory'
  const { story, rewards } = context.scenario
  return (
    <section className={`panel end result-${result}`} aria-label="Game over">
      <h2 className="result">{won ? 'Victory!' : 'Defeat'}</h2>
      <p className="end-reason">{resultText[result]}</p>
      <p className="story">{won ? story.victory : story.defeat}</p>
      <dl className="status">
        <Stat label="Ended in round" value={state.round} />
        <Stat label="Health left" value={`${Math.max(state.health, 0)} / ${maxHealth(state)}`} />
        {/* Rules-spec section 9: a defeat still earns XP (amount undecided) but no loot. */}
        <Stat label="XP earned" value={won ? rewards.victoryXp : 'Not decided yet'} />
        <Stat label="Loot" value={won ? `${rewards.chestGold} gold` : 'None'} />
        {seed !== undefined && <Stat label="Seed" value={seed} />}
      </dl>
      {(onReplay || onNewGame) && (
        <div className="options">
          {onNewGame && (
            <button type="button" className="primary" onClick={onNewGame}>
              New game
            </button>
          )}
          {onReplay && (
            <button type="button" onClick={onReplay}>
              Play this deal again
            </button>
          )}
        </div>
      )}
    </section>
  )
}
