// Renders the screen to HTML (no browser needed) and checks that it shows the engine state.

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { createContext, createGame, type GameState } from '../engine/gameState.ts'
import { GameScreen } from './GameScreen.tsx'
import { cardById } from './names.ts'

const context = createContext()
const render = (state: GameState) =>
  renderToStaticMarkup(<GameScreen context={context} state={state} />)

describe('GameScreen at the start of a game', () => {
  const state = createGame(context, 'warrior', 1)
  const html = render(state)

  it('shows the scenario and the hero status', () => {
    expect(html).toContain('The Sunken Crypt')
    expect(html).toContain('Warrior')
    expect(html).toContain('10 / 10')
    expect(html).toContain('None yet')
  })

  it('shows every card in the hand by name', () => {
    expect(state.deck.hand).toHaveLength(5)
    for (const id of state.deck.hand) expect(html).toContain(cardById(context, id).name)
  })

  it('shows the size of the draw pile but not its cards', () => {
    expect(html).toContain('5 cards')
    for (const id of state.deck.drawPile) expect(html).not.toContain(cardById(context, id).name)
  })

  it('shows the three goblins and keeps the Ogre hidden', () => {
    for (const id of ['G1', 'G2', 'G3']) expect(html).toContain(`>${id}<`)
    expect(html).not.toContain('Ogre')
  })

  it('draws one square per map space, with the door closed', () => {
    expect(html.match(/class="cell terrain-/g)).toHaveLength(context.scenario.spaces.length)
    expect(html).toContain('title="Door"')
  })
})

describe('GameScreen later in a game', () => {
  const start = createGame(context, 'warrior', 1)

  it('shows the Ogre once revealed, and removes dead monsters', () => {
    const state: GameState = {
      ...start,
      doorOpen: true,
      monsters: start.monsters.map((m) =>
        m.kind === 'ogre' ? { ...m, revealed: true } : m.id === 'G1' ? { ...m, health: 0 } : m,
      ),
    }
    const html = render(state)
    expect(html).toContain('Ogre')
    expect(html).toContain('Door (open)')
    expect(html).not.toContain('>G1<')
  })

  it('marks burn halves and lists discarded, lost and showing cards', () => {
    const state: GameState = {
      ...start,
      deck: {
        drawPile: [],
        hand: ['warrior-heavy-blow'],
        discard: ['warrior-sweep'],
        lost: ['warrior-cleave'],
        showing: [{ cardId: 'warrior-shield-bash', value: 2, burned: false }],
      },
    }
    const html = render(state)
    expect(html).toContain('Burn')
    expect(html).toContain('Sweep')
    expect(html).toContain('Cleave')
    expect(html).toContain('Shield Bash (Shield 2)')
  })
})
