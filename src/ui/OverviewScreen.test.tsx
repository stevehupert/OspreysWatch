// The "How to play" overview, rendered to HTML. Going there and back is covered by e2e/start.spec.ts.

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { heroStats } from '../engine/data/heroes.ts'
import { createContext } from '../engine/gameState.ts'
import { OverviewScreen } from './OverviewScreen.tsx'

const context = createContext()
const html = renderToStaticMarkup(<OverviewScreen context={context} onBack={() => {}} />)
// renderToStaticMarkup escapes apostrophes; the checks below only look at plain text.
const text = html.replace(/<[^>]+>/g, '')

describe('OverviewScreen', () => {
  it('has the three sections and a way back', () => {
    expect(html).toContain('<h1>How to play</h1>')
    for (const heading of ['Goal', 'A round', 'Cards and combat']) expect(html).toContain(heading)
    expect(html).toContain('>Back</button>')
  })

  it('counts the monsters from the scenario', () => {
    expect(text).toContain('(3 Goblins and an Ogre)')
  })

  it('takes its numbers from the engine data', () => {
    const { handSize, minDiscardToRest } = context.deckRules
    const { victoryXp, defeatXp, chestGold } = context.scenario.rewards
    expect(text).toContain(`A victory earns ${victoryXp} XP and ${chestGold} gold`)
    expect(text).toContain(`still earns ${defeatXp} XP`)
    expect(text).toContain(`draw back up to ${handSize} cards`)
    expect(text).toContain(`at least ${minDiscardToRest} cards in your discard pile`)
    expect(text).toContain(`shared enemy deck (${context.rules.enemyDeckSize} cards)`)
    expect(text).toContain(`a ${context.heroCards.warrior.length}-card deck`)
    expect(text).toContain(`Warrior: health ${heroStats.warrior.maxHealth}`)
    expect(text).toContain(`Mage: health ${heroStats.mage.maxHealth}`)
    expect(text).toContain(
      `Move ${context.generic.moveDistance}, Attack ${context.generic.attackDamage} next to you`,
    )
  })
})
