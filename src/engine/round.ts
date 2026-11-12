// How a round flows (rules-spec section 5):
//   play a card (or rest) -> flip and resolve one enemy card -> play a second card (or rest)
//   -> Frightening Roar, if in range -> draw back up to a full hand.

import { discardFromHand, drawUpTo, canRest } from './deck.ts'
import { ignoreEvents, type EventSink } from './events.ts'
import { manhattan } from './grid.ts'
import { performAction, type ActionResult, type HeroAction } from './heroActions.ts'
import { runMonsterPhase } from './monsterPhase.ts'
import { withResultIfOver, type GameContext, type GameState } from './gameState.ts'

/**
 * Apply one player action and advance the game as far as it can go without another decision:
 * after the first play the monster phase runs; after the second play the round ends,
 * unless Frightening Roar needs a card chosen first (then send a `discard` action).
 */
export function playAction(
  context: GameContext,
  state: GameState,
  action: HeroAction,
  log: EventSink = ignoreEvents,
): ActionResult {
  const result = advance(context, state, action, log)
  if (result.ok && result.state.result && !state.result) {
    log({ kind: 'gameOver', result: result.state.result })
  }
  return result
}

function advance(
  context: GameContext,
  state: GameState,
  action: HeroAction,
  log: EventSink,
): ActionResult {
  if (state.phase === 'over') return { ok: false, reason: 'The game is over' }
  if (state.phase === 'roar') return discardForRoar(context, state, action, log)

  const performed = performAction(context, state, action, log)
  if (!performed.ok) return performed
  let current = performed.state
  if (current.result) return { ok: true, state: current }

  if (current.playsDone === 1) {
    current = runMonsterPhase(context, current, undefined, log)
    current = failIfExhausted(context, current)
  } else if (roarApplies(context, current)) {
    current = { ...current, phase: 'roar' }
  } else {
    current = endRound(context, current, undefined, log)
  }
  return { ok: true, state: current }
}

function discardForRoar(
  context: GameContext,
  state: GameState,
  action: HeroAction,
  log: EventSink,
): ActionResult {
  if (action.type !== 'discard') return { ok: false, reason: 'Frightening Roar: discard a card' }
  if (!state.deck.hand.includes(action.card)) {
    return { ok: false, reason: `${action.card} is not in your hand` }
  }
  log({ kind: 'roarDiscard', card: action.card })
  return {
    ok: true,
    state: endRound(
      context,
      { ...state, deck: discardFromHand(state.deck, action.card) },
      undefined,
      log,
    ),
  }
}

/** Frightening Roar: an Ogre that is alive, revealed and within range makes you discard, if you hold a card. */
export function roarApplies(context: GameContext, state: GameState): boolean {
  return (
    state.deck.hand.length > 0 &&
    state.monsters.some(
      (m) =>
        m.kind === 'ogre' &&
        m.health > 0 &&
        m.revealed &&
        manhattan(m.pos, state.position) <= context.rules.roarRange,
    )
  )
}

/**
 * Finish a round: draw back up to a full hand and start the next round.
 * If Roar still has to be paid, `roarDiscard` names the card (the first card in hand if left out).
 */
export function endRound(
  context: GameContext,
  state: GameState,
  roarDiscard?: string,
  log: EventSink = ignoreEvents,
): GameState {
  let current = state
  if (current.phase === 'play' && roarApplies(context, current)) {
    const card = roarDiscard ?? current.deck.hand[0]
    log({ kind: 'roarDiscard', card })
    current = { ...current, deck: discardFromHand(current.deck, card) }
  }
  const deck = drawUpTo(current.deck, context.deckRules)
  log({
    kind: 'roundEnded',
    round: current.round,
    drew: deck.hand.length - current.deck.hand.length,
  })
  current = {
    ...current,
    phase: 'play',
    deck,
    round: current.round + 1,
    playsDone: 0,
    restsThisRound: 0,
  }
  return failIfExhausted(context, current)
}

/** You lose if you can neither play a card nor rest. */
export function failIfExhausted(context: GameContext, state: GameState): GameState {
  if (state.result || state.phase !== 'play') return state
  const mayRest =
    canRest(state.deck, context.deckRules) &&
    state.restsThisRound < context.roundRules.maxRestsPerRound
  if (state.deck.hand.length === 0 && !mayRest) {
    return { ...state, result: 'defeat-exhausted', phase: 'over' }
  }
  return withResultIfOver(state)
}
