// The Controls panel rendered to HTML, for states GameScreen only reaches after clicks.

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { createContext, createGame, type GameState } from '../engine/gameState.ts'
import { legalActions } from '../engine/legalActions.ts'
import { Controls } from './Controls.tsx'
import { cardById } from './names.ts'

const context = createContext()

describe('Controls while choosing the card a rest loses', () => {
  const start = createGame(context, 'warrior', 1)
  const state: GameState = {
    ...start,
    deck: { ...start.deck, discard: ['warrior-cleave', 'warrior-sweep'] },
  }
  const html = renderToStaticMarkup(
    <Controls
      context={context}
      state={state}
      actions={legalActions(context, state)}
      pending={{ kind: 'rest' }}
      onPick={() => {}}
      onStartRest={() => {}}
      onAction={() => {}}
      onCancel={() => {}}
    />,
  )

  it('shows each discarded card whole: name and both halves', () => {
    for (const id of state.deck.discard) {
      const card = cardById(context, id)
      expect(html).toContain(`<h3>${card.name}</h3>`)
      expect(html).toContain(card.halfA.text)
      expect(html).toContain(card.halfB.text)
    }
  })

  it('makes them clickable cards in the red "lose" group, with Cancel', () => {
    expect(html).toContain('class="cards lose" role="group" aria-label="Cards you can lose"')
    expect(html.match(/class="card clickable"/g)).toHaveLength(2)
    expect(html).toContain('>Cancel</button>')
  })
})
