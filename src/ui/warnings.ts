// Plain-language warnings for a play that wastes something (rules-spec open question 17):
// an attack or push that changes nothing, a Move that stays put, Arcane Recall taking back fewer
// cards than it could. The UI asks the player to confirm such a play instead of playing it at once.
//
// Whether an attack changes anything is not worked out here: the play is tried on the engine
// (performAction returns a new state and changes nothing) and the monsters are compared.

import type { Effect } from '../engine/data/cardTypes.ts'
import type { GameContext, GameState } from '../engine/gameState.ts'
import { genericEffects, performAction } from '../engine/heroActions.ts'
import { cardById } from './names.ts'
import type { PlayAction } from './selection.ts'

export function warningsFor(context: GameContext, state: GameState, play: PlayAction): string[] {
  const card = cardById(context, play.card)
  const half = play.use === 'A' ? card.halfA : play.use === 'B' ? card.halfB : null
  const effects: readonly Effect[] = half
    ? half.effects
    : play.use === 'move' || play.use === 'attack'
      ? genericEffects(context, play.use)
      : []
  const has = (kind: Effect['kind']) => effects.some((e) => e.kind === kind)

  const warnings: string[] = []
  if (has('move') && play.to === undefined) warnings.push('You stay where you are.')

  if (has('attack') || has('push')) {
    const result = performAction(context, state, play)
    const changed =
      result.ok && JSON.stringify(result.state.monsters) !== JSON.stringify(state.monsters)
    if (!changed) warnings.push('No enemy is hurt or moved.')
  }

  const recall = effects.find((e) => e.kind === 'returnCards')
  if (recall) {
    const most = Math.min(recall.count, state.deck.discard.length)
    const taken = play.returns?.length ?? 0
    if (taken < most) warnings.push(`You take back ${taken} of up to ${most} cards.`)
  }

  if (warnings.length > 0 && half?.burn) {
    warnings.push(`${card.name} burns: it is lost for the rest of the scenario.`)
  }
  return warnings
}
