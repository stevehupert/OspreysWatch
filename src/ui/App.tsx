import { useState } from 'react'
import { createContext, createGame } from '../engine/gameState.ts'
import type { HeroAction } from '../engine/heroActions.ts'
import { playAction } from '../engine/round.ts'
import { GameScreen } from './GameScreen.tsx'
import { readSetup } from './setup.ts'

function App() {
  const [context] = useState(() => createContext())
  const [state, setState] = useState(() => {
    const setup = readSetup(window.location.search)
    return createGame(context, setup.hero, setup.seed)
  })

  const onAction = (action: HeroAction) => {
    // The screen only offers legal actions, so a refusal here means a bug.
    const result = playAction(context, state, action)
    if (!result.ok)
      throw new Error(`The engine refused ${JSON.stringify(action)}: ${result.reason}`)
    setState(result.state)
  }

  return <GameScreen context={context} state={state} onAction={onAction} />
}

export default App
