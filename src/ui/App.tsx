import { useState } from 'react'
import type { GameEvent } from '../engine/events.ts'
import { createContext, createGame } from '../engine/gameState.ts'
import type { HeroAction } from '../engine/heroActions.ts'
import { playAction } from '../engine/round.ts'
import { addToLog, type LogRound } from './gameLog.ts'
import { GameScreen } from './GameScreen.tsx'
import { readSetup } from './setup.ts'

function App() {
  const [context] = useState(() => createContext())
  const [state, setState] = useState(() => {
    const setup = readSetup(window.location.search)
    return createGame(context, setup.hero, setup.seed)
  })
  const [log, setLog] = useState<readonly LogRound[]>([])

  const onAction = (action: HeroAction) => {
    const events: GameEvent[] = []
    const result = playAction(context, state, action, (event) => events.push(event))
    // The screen only offers legal actions, so a refusal here means a bug.
    if (!result.ok) {
      throw new Error(`The engine refused ${JSON.stringify(action)}: ${result.reason}`)
    }
    setState(result.state)
    setLog(addToLog(log, state.round, events))
  }

  return <GameScreen context={context} state={state} onAction={onAction} log={log} />
}

export default App
