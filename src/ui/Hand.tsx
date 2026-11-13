// The cards in your hand. Each card shows both halves; a play uses one of them.

import type { CardDefinition, CardHalf } from '../engine/data/cardTypes.ts'
import type { GameContext, GameState } from '../engine/gameState.ts'
import { cardById } from './names.ts'

interface HandProps {
  readonly context: GameContext
  readonly state: GameState
  /** Cards the player may click right now. Leave out for a read-only hand. */
  readonly clickable?: ReadonlySet<string>
  readonly selected?: string
  readonly onCardClick?: (card: string) => void
  /** Frightening Roar: a click discards the card instead of playing it, so the hand is marked in orange. */
  readonly discarding?: boolean
}

export function Hand(props: HandProps) {
  const { context, state, clickable, selected, onCardClick, discarding } = props
  return (
    <section className={`panel hand${discarding ? ' discarding' : ''}`} aria-label="Hand">
      <h2>Hand ({state.deck.hand.length})</h2>
      <div className="cards">
        {state.deck.hand.map((id) => (
          <CardView
            key={id}
            card={cardById(context, id)}
            selected={id === selected}
            onClick={clickable?.has(id) && onCardClick ? () => onCardClick(id) : undefined}
          />
        ))}
      </div>
    </section>
  )
}

function CardView(props: {
  readonly card: CardDefinition
  readonly selected: boolean
  readonly onClick?: () => void
}) {
  const { card, selected, onClick } = props
  const body = (
    <>
      <h3>{card.name}</h3>
      <HalfView label="A" half={card.halfA} />
      <HalfView label="B" half={card.halfB} />
    </>
  )
  const className = `card${selected ? ' selected' : ''}`
  if (!onClick) return <article className={className}>{body}</article>
  return (
    <button
      type="button"
      className={`${className} clickable`}
      aria-pressed={selected}
      onClick={onClick}
    >
      {body}
    </button>
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
