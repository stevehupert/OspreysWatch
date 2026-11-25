// "How to play": a short overview of the rules, opened from the start screen.
// Every number comes from the engine data, so the text stays right when the rules are tuned.

import { heroStats, type HeroId } from '../engine/data/heroes.ts'
import { monsterStats, type MonsterKind } from '../engine/data/monsters.ts'
import type { GameContext } from '../engine/gameState.ts'
import { heroNames } from './names.ts'

interface OverviewScreenProps {
  readonly context: GameContext
  readonly onBack: () => void
}

/** "3 Goblins and an Ogre", counted from the scenario's monster list. */
function monsterList(context: GameContext): string {
  const counts = new Map<MonsterKind, number>()
  for (const m of context.scenario.monsters) counts.set(m.kind, (counts.get(m.kind) ?? 0) + 1)
  const parts = [...counts].map(([kind, n]) => {
    const name = monsterStats[kind].name
    return n === 1 ? `${/^[AEIOU]/.test(name) ? 'an' : 'a'} ${name}` : `${n} ${name}s`
  })
  return parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}` : parts[0]
}

const heroIds = Object.keys(heroStats) as HeroId[]

export function OverviewScreen({ context, onBack }: OverviewScreenProps) {
  const { handSize, minDiscardToRest } = context.deckRules
  const { generic, rules, scenario } = context
  const { victoryXp, defeatXp, chestGold } = scenario.rewards
  const deckSize = context.heroCards[heroIds[0]].length

  return (
    <main className="game start">
      <h1>How to play</h1>

      <section className="panel" aria-labelledby="overview-goal">
        <h2 id="overview-goal">Goal</h2>
        <p>
          You play one hero alone in {scenario.name}. You <strong>win</strong> the moment every
          monster is dead ({monsterList(context)}) and you have looted the treasure chest. You{' '}
          <strong>lose</strong> if your health drops to 0, or if you are exhausted: you cannot play
          a card and cannot rest.
        </p>
        <p>
          A victory earns {victoryXp} XP and {chestGold} gold. A defeat still earns {defeatXp} XP,
          but no loot.
        </p>
      </section>

      <section className="panel" aria-labelledby="overview-round">
        <h2 id="overview-round">A round</h2>
        <ol>
          <li>
            <strong>First play.</strong> Play one card from your hand, or rest.
          </li>
          <li>
            <strong>Monster phase.</strong> If any monster is active, one card is flipped from the
            shared enemy deck ({rules.enemyDeckSize} cards). It says which monsters move and attack.
          </li>
          <li>
            <strong>Second play.</strong> Play a second card, or rest.
          </li>
          <li>
            <strong>End of round.</strong> End-of-round effects happen, then you draw back up to{' '}
            {handSize} cards.
          </li>
        </ol>
        <p>
          <strong>Resting</strong> can replace either play, at most{' '}
          {context.roundRules.maxRestsPerRound === 1
            ? 'once'
            : `${context.roundRules.maxRestsPerRound} times`}{' '}
          a round. You need at least {minDiscardToRest} cards in your discard pile. You lose one of
          them for the rest of the scenario, shuffle the others back into your draw pile, and draw
          up to {handSize}.
        </p>
      </section>

      <section className="panel" aria-labelledby="overview-cards">
        <h2 id="overview-cards">Cards and combat</h2>
        <ul>
          <li>
            Each hero has a {deckSize}-card deck and holds up to {handSize} cards. (
            {heroIds.map((id) => `${heroNames[id]}: health ${heroStats[id].maxHealth}`).join(', ')}
            .)
          </li>
          <li>
            Each card has two halves. A play uses one half. Any card can instead be played as Move{' '}
            {generic.moveDistance}, Attack {generic.attackDamage} next to you, Loot, or Interact.
          </li>
          <li>
            A half marked <strong>Burn</strong> sends the card to the lost pile: it is gone for the
            rest of the scenario.
          </li>
          <li>
            <strong>Shields do not add up.</strong> Your shield is the higher of your base shield
            and the best shield card showing. A shield card stays out until the next monster phase.
          </li>
          <li>
            Damage you take is the monster&apos;s attack minus your shield. Damage you deal is your
            attack minus the monster&apos;s armor. Neither goes below 0.
          </li>
        </ul>
      </section>

      <div className="options">
        <button type="button" onClick={onBack}>
          Back
        </button>
      </div>
    </main>
  )
}
