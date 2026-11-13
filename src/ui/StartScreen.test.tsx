// The start screen, rendered to HTML. Clicking through it is covered by e2e/start.spec.ts.

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { heroStats } from '../engine/data/heroes.ts'
import { createContext } from '../engine/gameState.ts'
import { StartScreen } from './StartScreen.tsx'

const context = createContext()
const html = renderToStaticMarkup(<StartScreen context={context} seed={1234} onStart={() => {}} />)

describe('StartScreen', () => {
  it('shows the scenario name and its story', () => {
    expect(html).toContain(context.scenario.name)
    expect(html).toContain(context.scenario.story.intro)
  })

  it('offers both heroes with their health and base shield, the Warrior picked first', () => {
    expect(html).toContain(
      `<strong>Warrior</strong><span>Health ${heroStats.warrior.maxHealth}, base shield ${heroStats.warrior.baseShield}</span>`,
    )
    expect(html).toContain(
      `<strong>Mage</strong><span>Health ${heroStats.mage.maxHealth}, base shield ${heroStats.mage.baseShield}</span>`,
    )
    expect(html).toContain('name="hero" checked="" value="warrior"')
  })

  it('fills in the seed it was given', () => {
    expect(html).toContain('value="1234"')
    expect(html).toContain('Start game')
  })
})
