// Words for the choices a play offers: button labels and the question asked at each step.

import type { CardDefinition } from '../engine/data/cardTypes.ts'
import type { GameContext } from '../engine/gameState.ts'
import { cardById } from './names.ts'
import type { Field, PlayAction } from './selection.ts'

export const prompts: Record<Field, string> = {
  use: 'How do you want to use this card?',
  to: 'Choose where to move: click a highlighted space.',
  target: 'Choose a target: click a highlighted monster.',
  second: 'Choose a second enemy next to you: click a highlighted monster.',
  axis: 'This push is at a diagonal: choose which way it goes.',
  returns: 'Choose the cards to take back from your discard pile.',
}

/** The button text for one value of a choice, or null when the choice is made on the map. */
export function optionLabel(
  context: GameContext,
  card: CardDefinition,
  field: Field,
  value: unknown,
): string | null {
  switch (field) {
    case 'use':
      return labelForUse(context, card, value as PlayAction['use'])
    case 'to':
      return value === undefined ? 'Stay here' : null
    case 'target':
      return value === undefined ? 'No target' : null
    case 'second':
      return value === undefined ? 'No second target' : null
    case 'axis':
      return value === 'row' ? 'Push up or down' : 'Push left or right'
    case 'returns': {
      const ids = (value as readonly string[] | undefined) ?? []
      if (ids.length === 0) return 'Take back nothing'
      return `Take back ${ids.map((id) => cardById(context, id).name).join(' and ')}`
    }
  }
}

function labelForUse(context: GameContext, card: CardDefinition, use: PlayAction['use']): string {
  switch (use) {
    case 'A':
      return `A: ${card.halfA.text}${card.halfA.burn ? ' (Burn)' : ''}`
    case 'B':
      return `B: ${card.halfB.text}${card.halfB.burn ? ' (Burn)' : ''}`
    case 'move':
      return `Move ${context.generic.moveDistance} (any card)`
    case 'attack':
      return `Attack ${context.generic.attackDamage} (any card)`
    case 'loot':
      return 'Loot the chest'
    case 'interact':
      return 'Open the door'
  }
}
