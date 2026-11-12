// The cards in your hand. Each card shows both halves; a play uses one of them.

import type { CardDefinition, CardHalf } from '../engine/data/cardTypes.ts'
import type { GameContext, GameState } from '../engine/gameState.ts'
import { cardById } from './names.ts'

interface HandProps {
  readonly context: GameContext
  readonly state: GameState
}

export function Hand({ context, state }: HandProps) {
  return (
    <section className="panel" aria-label="Hand">
      <h2>Hand ({state.deck.hand.length})</h2>
      <div className="cards">
        {state.deck.hand.map((id) => (
          <CardView key={id} card={cardById(context, id)} />
        ))}
      </div>
    </section>
  )
}

function CardView({ card }: { readonly card: CardDefinition }) {
  return (
    <article className="card">
      <h3>{card.name}</h3>
      <HalfView label="A" half={card.halfA} />
      <HalfView label="B" half={card.halfB} />
    </article>
  )
}

function HalfView({ label, half }: { readonly label: string; readonly half: CardHalf }) {
  return (
    <div className="half">
      <span className="half-label">{label}</span>
      <span className="half-text">{half.text}</span>
      {half.burn && <span className="tag burn">Burn</span>}
    </div>
  )
}
