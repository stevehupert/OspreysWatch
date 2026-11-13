// The whole game screen: status, map, monsters, controls, hand and piles.
// It keeps the play the player is building (which card, which half, ...) and hands finished
// actions to `onAction`. Without `onAction` the screen is read-only.

import { useMemo, useState } from 'react'
import { monsterStats } from '../engine/data/monsters.ts'
import {
  currentShield,
  maxHealth,
  targetableMonsters,
  type GameContext,
  type GameState,
} from '../engine/gameState.ts'
import type { Pos } from '../engine/grid.ts'
import type { HeroAction } from '../engine/heroActions.ts'
import { legalActions } from '../engine/legalActions.ts'
import { Board } from './Board.tsx'
import { Controls } from './Controls.tsx'
import { EndPanel } from './EndPanel.tsx'
import { Hand } from './Hand.tsx'
import { lastEnemyCard, type LogRound } from './gameLog.ts'
import { LogPanel } from './LogPanel.tsx'
import { cardById, enemyCardById, heroNames } from './names.ts'
import {
  isMapField,
  matchingPlays,
  nextField,
  options,
  playableCards,
  type Pending,
  type Pick,
} from './selection.ts'
import { Stat } from './Stat.tsx'
import { warningsFor } from './warnings.ts'

interface GameScreenProps {
  readonly context: GameContext
  readonly state: GameState
  readonly onAction?: (action: HeroAction) => void
  /** What has happened so far. Leave out to hide the log. */
  readonly log?: readonly LogRound[]
  /** The seed this game was dealt with, shown so the game can be replayed. */
  readonly seed?: number
  /** Shown as buttons on the end panel when given. */
  readonly onReplay?: () => void
  readonly onNewGame?: () => void
}

export function GameScreen(props: GameScreenProps) {
  const { context, state, onAction, log } = props
  const [pending, setPending] = useState<Pending | null>(null)
  const actions = useMemo(
    () => (onAction ? legalActions(context, state) : []),
    [context, state, onAction],
  )

  const act = (action: HeroAction) => {
    setPending(null)
    onAction?.(action)
  }

  const clickCard = (card: string) => {
    if (state.phase === 'roar') return act({ type: 'discard', card })
    const same = pending?.kind === 'play' && pending.card === card
    setPending(same ? null : { kind: 'play', card, picks: [] })
  }

  // Add a choice. If that leaves one play and it wastes nothing, play it straight away.
  const pick = (choice: Pick) => {
    if (pending?.kind !== 'play') return
    const picks = [...pending.picks, choice]
    const plays = matchingPlays(actions, pending.card, picks)
    if (plays.length === 1 && warningsFor(context, state, plays[0]).length === 0) {
      return act(plays[0])
    }
    setPending({ ...pending, picks })
  }

  // What the map offers right now: destinations for a Move, monsters for a target.
  const plays = pending?.kind === 'play' ? matchingPlays(actions, pending.card, pending.picks) : []
  const field = plays.length > 0 ? nextField(plays) : null
  const mapValues =
    field && isMapField(field) ? options(plays, field).filter((v) => v !== undefined) : []

  return (
    <main className="game">
      <h1>{context.scenario.name}</h1>
      {state.result && (
        <EndPanel
          context={context}
          state={state}
          result={state.result}
          seed={props.seed}
          onReplay={props.onReplay}
          onNewGame={props.onNewGame}
        />
      )}
      <StatusBar context={context} state={state} log={log} seed={props.seed} />
      <div className="table">
        <Board
          context={context}
          state={state}
          selectableSpaces={field === 'to' ? (mapValues as Pos[]) : undefined}
          selectableMonsters={
            field === 'target' || field === 'second' ? (mapValues as string[]) : undefined
          }
          chosenSpace={
            pending?.kind === 'play'
              ? (pending.picks.find((p) => p.field === 'to')?.value as Pos | undefined)
              : undefined
          }
          onSpaceClick={(to) => pick({ field: 'to', value: to })}
          onMonsterClick={(id) => field && pick({ field, value: id })}
        />
        <div className="side">
          {log && <LogPanel context={context} log={log} />}
          <Monsters state={state} />
        </div>
      </div>
      {onAction && !state.result && (
        <Controls
          context={context}
          state={state}
          actions={actions}
          pending={pending}
          onPick={pick}
          onStartRest={() => setPending({ kind: 'rest' })}
          onAction={act}
          onCancel={() => setPending(null)}
        />
      )}
      <Hand
        context={context}
        state={state}
        clickable={
          !onAction || state.result
            ? undefined
            : state.phase === 'roar'
              ? new Set(state.deck.hand)
              : playableCards(actions)
        }
        selected={pending?.kind === 'play' ? pending.card : undefined}
        onCardClick={clickCard}
        discarding={!!onAction && state.phase === 'roar'}
      />
      <Piles context={context} state={state} />
    </main>
  )
}

function StatusBar({ context, state, log, seed }: GameScreenProps) {
  // From the log, not the enemy discard pile: Unleash Doom shuffles that pile away.
  const lastFlip = log && lastEnemyCard(log)
  const lastFlipName = lastFlip && enemyCardById(context, lastFlip).name
  return (
    <dl className="status" aria-label="Status">
      <Stat label="Hero" value={heroNames[state.heroId]} />
      <Stat label="Health" value={`${state.health} / ${maxHealth(state)}`} />
      <Stat label="Shield" value={currentShield(state)} />
      <Stat label="Round" value={state.round} />
      <Stat label="Enemy deck" value={`${state.enemyDeck.drawPile.length} left`} />
      <Stat label="Last enemy card" value={lastFlipName ?? 'None yet'} />
      {seed !== undefined && <Stat label="Seed" value={seed} />}
      {state.phase === 'roar' && (
        <Stat label="Frightening Roar" value="Discard a card" className="roar" />
      )}
    </dl>
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
