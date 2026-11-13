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

describe('GameScreen when playing', () => {
  const start = createGame(context, 'warrior', 1)
  const renderPlayable = (state: GameState) =>
    renderToStaticMarkup(<GameScreen context={context} state={state} onAction={() => {}} />)

  it('asks for a card and makes the hand clickable', () => {
    const html = renderPlayable(start)
    expect(html).toContain('Round 1, play 1 of 2: click a card in your hand.')
    expect(html.match(/<button type="button" class="card clickable"/g)).toHaveLength(5)
  })

  it('offers a rest when the discard pile allows one', () => {
    const state: GameState = {
      ...start,
      deck: { ...start.deck, discard: ['warrior-cleave', 'warrior-second-wind'] },
    }
    expect(renderPlayable(state)).toContain('or rest.')
  })

  it('asks for a discard during Frightening Roar', () => {
    const html = renderPlayable({ ...start, phase: 'roar' })
    expect(html).toContain('Frightening Roar')
    expect(html).toContain('discard it')
    expect(html.match(/class="card clickable"/g)).toHaveLength(5)
  })

  it('marks the Roar discard in orange: the hand, the controls and the status bar', () => {
    const html = renderPlayable({ ...start, phase: 'roar' })
    expect(html).toContain('class="panel hand discarding"')
    expect(html).toContain('class="panel controls roar"')
    expect(html).toContain(
      '<div class="stat roar"><dt>Frightening Roar</dt><dd>Discard a card</dd></div>',
    )
  })

  it('has no Roar marks during an ordinary play', () => {
    const html = renderPlayable(start)
    expect(html).not.toContain('discarding')
    expect(html).not.toContain('roar')
  })

  it('shows the end panel, no controls and no clickable cards once the game is over', () => {
    const html = renderPlayable({ ...start, phase: 'over', result: 'defeat-exhausted' })
    expect(html).toContain('aria-label="Game over"')
    expect(html).toContain('You ran out of cards')
    expect(html).not.toContain('aria-label="Controls"')
    expect(html).not.toContain('clickable')
  })

  it('has no end panel while the game is on', () => {
    expect(renderPlayable(start)).not.toContain('Game over')
  })

  it('has no controls when read-only', () => {
    expect(render(start)).not.toContain('aria-label="Controls"')
  })
})

describe('GameScreen with an empty hand', () => {
  it('says that you must rest', () => {
    const start = createGame(context, 'warrior', 1)
    const state: GameState = {
      ...start,
      deck: { ...start.deck, hand: [], discard: ['warrior-cleave', 'warrior-sweep'] },
    }
    const html = renderToStaticMarkup(
      <GameScreen context={context} state={state} onAction={() => {}} />,
    )
    expect(html).toContain('your hand is empty, so you must rest')
    expect(html).toContain('>Rest</button>')
  })
})

describe('GameScreen with a log', () => {
  const start = createGame(context, 'warrior', 1)

  it('shows the last enemy card from the log, even after Unleash Doom emptied the enemy discard pile', () => {
    const log = [
      {
        round: 3,
        events: [
          { kind: 'enemyCardFlipped' as const, card: 'unleash-doom', deckRefilled: false },
          { kind: 'enemyDeckReshuffled' as const },
        ],
      },
    ]
    const state: GameState = { ...start, enemyDeck: { ...start.enemyDeck, discard: [] } }
    const html = renderToStaticMarkup(
      <GameScreen context={context} state={state} onAction={() => {}} log={log} />,
    )
    expect(html).toContain('<dd>Unleash Doom</dd>')
    expect(html).toContain('<summary>Round 3</summary>')
    expect(html).toContain('the whole enemy deck is shuffled together again')
  })

  it('says when nothing has happened yet', () => {
    const html = renderToStaticMarkup(
      <GameScreen context={context} state={start} onAction={() => {}} log={[]} />,
    )
    expect(html).toContain('Nothing has happened yet.')
  })
})
