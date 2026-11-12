import { useState } from 'react'
import { createContext, createGame } from '../engine/gameState.ts'
import { GameScreen } from './GameScreen.tsx'
import { readSetup } from './setup.ts'

function App() {
  // The game is created once. Nothing changes it yet: playing cards comes in a later step.
  const [{ context, state }] = useState(() => {
    const setup = readSetup(window.location.search)
    const context = createContext()
    return { context, state: createGame(context, setup.hero, setup.seed) }
  })
  return <GameScreen context={context} state={state} />
}

export default App
