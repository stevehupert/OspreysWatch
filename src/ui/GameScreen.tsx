// The whole game screen: status, map, monsters, hand and piles. Read-only for now.

import { monsterStats } from '../engine/data/monsters.ts'
import {
  currentShield,
  maxHealth,
  targetableMonsters,
  type GameContext,
  type GameState,
} from '../engine/gameState.ts'
import { Board } from './Board.tsx'
import { Hand } from './Hand.tsx'
import { cardById, heroNames } from './names.ts'

interface GameScreenProps {
  readonly context: GameContext
  readonly state: GameState
}

export function GameScreen({ context, state }: GameScreenProps) {
  return (
    <main className="game">
      <h1>{context.scenario.name}</h1>
      <StatusBar context={context} state={state} />
      <div className="table">
        <Board context={context} state={state} />
        <Monsters state={state} />
      </div>
      <Hand context={context} state={state} />
      <Piles context={context} state={state} />
    </main>
  )
}

function StatusBar({ context, state }: GameScreenProps) {
  const lastFlip = state.enemyDeck.discard.at(-1)
  const lastFlipName = lastFlip && context.enemyCards.find((card) => card.id === lastFlip)?.name
  return (
    <dl className="status" aria-label="Status">
      <Stat label="Hero" value={heroNames[state.heroId]} />
      <Stat label="Health" value={`${state.health} / ${maxHealth(state)}`} />
      <Stat label="Shield" value={currentShield(state)} />
      <Stat label="Round" value={state.round} />
      <Stat label="Enemy deck" value={`${state.enemyDeck.drawPile.length} left`} />
      <Stat label="Last enemy card" value={lastFlipName ?? 'None yet'} />
    </dl>
  )
}

function Stat({ label, value }: { readonly label: string; readonly value: string | number }) {
  return (
    <div className="stat">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function Monsters({ state }: { readonly state: GameState }) {
  const monsters = targetableMonsters(state)
  return (
    <section className="panel monsters" aria-label="Monsters">
      <h2>Monsters</h2>
      {monsters.length === 0 ? (
        <p className="empty">None in sight</p>
      ) : (
        <ul>
          {monsters.map((m) => {
            const stats = monsterStats[m.kind]
            return (
              <li key={m.id}>
                <strong>
                  {m.id} {stats.name}
                </strong>{' '}
                {m.health} / {stats.health} health
                <br />
                Move {stats.move}, Attack {stats.attack}, Armor {stats.armor}
                <br />
                <span className="special">{stats.special}</span>
                {m.frozen && <span className="tag">Frozen</span>}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function Piles({ context, state }: GameScreenProps) {
  const names = (ids: readonly string[]) => ids.map((id) => cardById(context, id).name)
  const { deck } = state
  return (
    <section className="panel piles" aria-label="Piles">
      {/* The draw pile is face down, so only its size is shown. */}
      <Pile title="Draw pile" summary={`${deck.drawPile.length} cards`} />
      <Pile
        title="Showing shields"
        cards={deck.showing.map((s) => `${cardById(context, s.cardId).name} (Shield ${s.value})`)}
      />
      <Pile title="Discard" cards={names(deck.discard)} />
      <Pile title="Lost" cards={names(deck.lost)} />
    </section>
  )
}

function Pile(props: {
  readonly title: string
  readonly summary?: string
  readonly cards?: readonly string[]
}) {
  return (
    <div className="pile">
      <h2>{props.title}</h2>
      {props.summary !== undefined ? (
        <p>{props.summary}</p>
      ) : props.cards && props.cards.length > 0 ? (
        <ul>
          {props.cards.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      ) : (
        <p className="empty">Empty</p>
      )}
    </div>
  )
}
