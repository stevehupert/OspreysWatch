// The end panel, rendered to HTML: the right result, story text and rewards from the scenario data.

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { createContext, createGame, type GameResult } from '../engine/gameState.ts'
import { EndPanel } from './EndPanel.tsx'
import { GameScreen } from './GameScreen.tsx'

const context = createContext()
const { story, rewards } = context.scenario

const render = (
  result: GameResult,
  extra: { onReplay?: () => void; onNewGame?: () => void } = {},
) => {
  const state = { ...createGame(context, 'mage', 7), phase: 'over', result } as const
  return renderToStaticMarkup(
    <EndPanel context={context} state={state} result={result} seed={7} {...extra} />,
  )
}

describe('EndPanel', () => {
  it('shows a victory with its story text, XP and the chest gold', () => {
    const html = render('victory')
    expect(html).toContain('Victory!')
    expect(html).toContain(story.victory)
    expect(html).not.toContain(story.defeat)
    expect(html).toContain(`<dd>${rewards.victoryXp}</dd>`)
    expect(html).toContain(`${rewards.chestGold} gold`)
  })

  it('shows a defeat with no loot and the XP still undecided', () => {
    for (const result of ['defeat-health', 'defeat-exhausted'] as const) {
      const html = render(result)
      expect(html).toContain('Defeat')
      expect(html).toContain(story.defeat)
      expect(html).toContain('Not decided yet')
      expect(html).toContain('<dd>None</dd>')
    }
    expect(render('defeat-health')).toContain('You ran out of health.')
    expect(render('defeat-exhausted')).toContain('You ran out of cards')
  })

  it('shows the seed, so the deal can be replayed', () => {
    expect(render('victory')).toContain('<dt>Seed</dt><dd>7</dd>')
  })

  it('shows only the buttons it has handlers for', () => {
    expect(render('victory')).not.toContain('<button')
    const html = render('victory', { onReplay: () => {}, onNewGame: () => {} })
    expect(html).toContain('New game')
    expect(html).toContain('Play this deal again')
  })
})

describe('GameScreen seed', () => {
  it('shows the seed in the status bar when given', () => {
    const state = createGame(context, 'warrior', 1)
    expect(
      renderToStaticMarkup(<GameScreen context={context} state={state} seed={42} />),
    ).toContain('<dt>Seed</dt><dd>42</dd>')
    expect(renderToStaticMarkup(<GameScreen context={context} state={state} />)).not.toContain(
      'Seed',
    )
  })
})
