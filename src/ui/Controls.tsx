// The panel that asks the next question: what to play, how, and (for wasteful plays) "are you sure?".
// It only shows options; GameScreen decides what a click means.

import type { GameContext, GameState } from '../engine/gameState.ts'
import type { HeroAction } from '../engine/heroActions.ts'
import { optionLabel, prompts } from './labels.ts'
import { cardById } from './names.ts'
import {
  isMapField,
  matchingPlays,
  nextField,
  options,
  restActions,
  type Pending,
  type Pick,
} from './selection.ts'
import { warningsFor } from './warnings.ts'

interface ControlsProps {
  readonly context: GameContext
  readonly state: GameState
  readonly actions: readonly HeroAction[]
  readonly pending: Pending | null
  readonly onPick: (pick: Pick) => void
  readonly onStartRest: () => void
  readonly onAction: (action: HeroAction) => void
  readonly onCancel: () => void
}

export function Controls(props: ControlsProps) {
  const { context, state, pending } = props

  const roar = state.phase === 'roar'
  return (
    <section className={`panel controls${roar ? ' roar' : ''}`} aria-label="Controls">
      {roar ? (
        <p className="prompt">
          Frightening Roar: the Ogre is within {context.rules.roarRange} spaces. Click a card in
          your hand to discard it.
        </p>
      ) : pending === null ? (
        <ChooseCard {...props} />
      ) : pending.kind === 'rest' ? (
        <ChooseRest {...props} />
      ) : (
        <ChoosePlay {...props} card={pending.card} picks={pending.picks} />
      )}
    </section>
  )
}

function ChooseCard({ context, state, actions, onStartRest }: ControlsProps) {
  const canRest = restActions(actions).length > 0
  const what =
    state.deck.hand.length === 0
      ? 'your hand is empty, so you must rest'
      : `click a card in your hand${canRest ? ', or rest' : ''}`
  return (
    <>
      <p className="prompt">
        Round {state.round}, play {state.playsDone + 1} of {context.roundRules.playsPerRound}:{' '}
        {what}.
      </p>
      {canRest && (
        <div className="options">
          <button type="button" onClick={onStartRest}>
            Rest
          </button>
        </div>
      )}
    </>
  )
}

function ChooseRest({ context, actions, onAction, onCancel }: ControlsProps) {
  return (
    <>
      <p className="prompt">
        Rest: your discard pile is shuffled back into your draw pile and you draw up to a full hand.
        Choose one discarded card to lose for the rest of the scenario.
      </p>
      <div className="options">
        {restActions(actions).map((action) => (
          <button key={action.lose} type="button" onClick={() => onAction(action)}>
            Lose {cardById(context, action.lose).name}
          </button>
        ))}
        <CancelButton onCancel={onCancel} />
      </div>
    </>
  )
}

function ChoosePlay(
  props: ControlsProps & { readonly card: string; readonly picks: readonly Pick[] },
) {
  const { context, state, actions, card, picks, onPick, onAction, onCancel } = props
  const definition = cardById(context, card)
  const plays = matchingPlays(actions, card, picks)
  const field = nextField(plays)

  // Only one play is left. It is waiting here only because it wastes something.
  if (field === null) {
    const play = plays[0]
    return (
      <>
        <p className="prompt">{definition.name}: are you sure? This play wastes something:</p>
        <ul className="warnings">
          {warningsFor(context, state, play).map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
        <div className="options">
          <button type="button" onClick={() => onAction(play)}>
            Play anyway
          </button>
          <CancelButton onCancel={onCancel} />
        </div>
      </>
    )
  }

  const buttons = options(plays, field).flatMap((value) => {
    const label = optionLabel(context, definition, field, value)
    return label === null ? [] : [{ value, label }]
  })
  return (
    <>
      <p className="prompt">
        <strong>{definition.name}.</strong> {prompts[field]}
        {isMapField(field) && buttons.length > 0 && ' Or:'}
      </p>
      <div className="options">
        {buttons.map(({ value, label }) => (
          <button key={label} type="button" onClick={() => onPick({ field, value })}>
            {label}
          </button>
        ))}
        <CancelButton onCancel={onCancel} />
      </div>
    </>
  )
}

function CancelButton({ onCancel }: { readonly onCancel: () => void }) {
  return (
    <button type="button" className="cancel" onClick={onCancel}>
      Cancel
    </button>
  )
}
