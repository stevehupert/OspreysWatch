// The start screen: the scenario's story, a choice of hero, and the seed for the shuffles.

import { useState, type FormEvent } from 'react'
import { heroStats, type HeroId } from '../engine/data/heroes.ts'
import type { GameContext } from '../engine/gameState.ts'
import { heroNames } from './names.ts'
import { parseSeed, type GameSetup } from './setup.ts'

interface StartScreenProps {
  readonly context: GameContext
  /** The seed filled in to begin with. */
  readonly seed: number
  readonly onStart: (setup: GameSetup) => void
}

const heroStyles: Record<HeroId, string> = {
  warrior: 'Fights up close and pushes enemies into the lava.',
  mage: 'Fights from a distance with spells.',
}

const heroIds = Object.keys(heroStats) as HeroId[]

export function StartScreen({ context, seed, onStart }: StartScreenProps) {
  const [hero, setHero] = useState<HeroId>('warrior')
  const [seedText, setSeedText] = useState(String(seed))
  const parsedSeed = parseSeed(seedText)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (parsedSeed !== null) onStart({ hero, seed: parsedSeed })
  }

  return (
    <main className="game start">
      <h1>{context.scenario.name}</h1>
      <p className="story">{context.scenario.story.intro}</p>
      <form className="panel start-form" onSubmit={submit}>
        <fieldset className="heroes">
          <legend>Choose your hero</legend>
          {heroIds.map((id) => (
            <label key={id} className={`hero-choice${hero === id ? ' selected' : ''}`}>
              <input
                type="radio"
                name="hero"
                value={id}
                checked={hero === id}
                onChange={() => setHero(id)}
              />
              <strong>{heroNames[id]}</strong>
              <span>
                Health {heroStats[id].maxHealth}, base shield {heroStats[id].baseShield}
              </span>
              <span className="special">{heroStyles[id]}</span>
            </label>
          ))}
        </fieldset>
        <label className="seed">
          Seed
          <input
            type="text"
            inputMode="numeric"
            value={seedText}
            onChange={(e) => setSeedText(e.target.value)}
            aria-invalid={parsedSeed === null}
            aria-describedby="seed-help"
          />
        </label>
        <p id="seed-help" className={parsedSeed === null ? 'seed-error' : 'special'}>
          {parsedSeed === null
            ? 'The seed must be a whole number.'
            : 'The seed decides every shuffle. The same hero and seed always deal the same game.'}
        </p>
        <div className="options">
          <button type="submit" className="primary" disabled={parsedSeed === null}>
            Start game
          </button>
        </div>
      </form>
    </main>
  )
}
