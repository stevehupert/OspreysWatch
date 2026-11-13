// The app: the start screen until a game is chosen, then the game screen.
// A game named in the address (?hero=mage&seed=7) skips the start screen.

import { useState } from 'react'
import type { GameEvent } from '../engine/events.ts'
import { createContext, createGame, type GameState } from '../engine/gameState.ts'
import type { HeroAction } from '../engine/heroActions.ts'
import { playAction } from '../engine/round.ts'
import { addToLog, type LogRound } from './gameLog.ts'
import { GameScreen } from './GameScreen.tsx'
import { randomSeed, readSetup, setupQuery, type GameSetup } from './setup.ts'
import { StartScreen } from './StartScreen.tsx'

interface Game {
  readonly setup: GameSetup
  readonly state: GameState
  readonly log: readonly LogRound[]
  /** Counts games started, so the screen's half-built play is cleared for a new game. */
  readonly number: number
}

function App() {
  const [context] = useState(() => createContext())
  const [game, setGame] = useState<Game | null>(() => {
    const setup = readSetup(window.location.search)
    return (
      setup && { setup, state: createGame(context, setup.hero, setup.seed), log: [], number: 1 }
    )
  })

  const start = (setup: GameSetup) => {
    // Put the game in the address, so reloading the page or sharing the link deals the same game.
    window.history.replaceState(null, '', setupQuery(setup))
    setGame({
      setup,
      state: createGame(context, setup.hero, setup.seed),
      log: [],
      number: (game?.number ?? 0) + 1,
    })
  }

  const newGame = () => {
    window.history.replaceState(null, '', window.location.pathname)
    setGame(null)
  }

  if (!game) return <StartScreen context={context} seed={randomSeed()} onStart={start} />

  const onAction = (action: HeroAction) => {
    const events: GameEvent[] = []
    const result = playAction(context, game.state, action, (event) => events.push(event))
    // The screen only offers legal actions, so a refusal here means a bug.
    if (!result.ok) {
      throw new Error(`The engine refused ${JSON.stringify(action)}: ${result.reason}`)
    }
    setGame({
      ...game,
      state: result.state,
      log: addToLog(game.log, game.state.round, events),
    })
  }

  return (
    <GameScreen
      key={game.number}
      context={context}
      state={game.state}
      onAction={onAction}
      log={game.log}
      seed={game.setup.seed}
      onReplay={() => start(game.setup)}
      onNewGame={newGame}
    />
  )
}

export default App
