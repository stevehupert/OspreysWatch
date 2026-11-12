// Turning clicks into an action. The engine's legalActions list is narrowed one choice at a time:
// first the card, then how to use it, then where to move, whom to hit, and so on. There are no
// rules here: every option offered comes from the list, so only legal plays can be built.

import type { HeroAction } from '../engine/heroActions.ts'

export type PlayAction = Extract<HeroAction, { type: 'play' }>

/** The choices inside a play, in the order the player makes them. */
export type Field = 'use' | 'to' | 'target' | 'second' | 'axis' | 'returns'
const fieldOrder: readonly Field[] = ['use', 'to', 'target', 'second', 'axis', 'returns']

export interface Pick {
  readonly field: Field
  /** `undefined` is a real choice: stay put, no target, take back nothing. */
  readonly value: unknown
}

/** A play or rest the player has started but not finished. */
export type Pending =
  | { readonly kind: 'play'; readonly card: string; readonly picks: readonly Pick[] }
  | { readonly kind: 'rest' }

const sameValue = (a: unknown, b: unknown) =>
  JSON.stringify(a ?? null) === JSON.stringify(b ?? null)

/** The legal plays of one card that agree with every pick so far. */
export function matchingPlays(
  actions: readonly HeroAction[],
  card: string,
  picks: readonly Pick[],
): PlayAction[] {
  return actions.filter(
    (a): a is PlayAction =>
      a.type === 'play' && a.card === card && picks.every((p) => sameValue(a[p.field], p.value)),
  )
}

/** The first choice on which the remaining plays still differ, or null if only one play is left. */
export function nextField(plays: readonly PlayAction[]): Field | null {
  for (const field of fieldOrder) {
    if (options(plays, field).length > 1) return field
  }
  return null
}

/** The different values the remaining plays have for a choice, in the order they first appear. */
export function options(plays: readonly PlayAction[], field: Field): unknown[] {
  const seen: unknown[] = []
  for (const play of plays) {
    if (!seen.some((value) => sameValue(value, play[field]))) seen.push(play[field])
  }
  return seen
}

/** Choices made by clicking the map (a space or a monster) rather than a button. */
export const isMapField = (field: Field): field is 'to' | 'target' | 'second' =>
  field === 'to' || field === 'target' || field === 'second'

/** Cards in hand that have at least one legal play. */
export function playableCards(actions: readonly HeroAction[]): Set<string> {
  return new Set(actions.flatMap((a) => (a.type === 'play' ? [a.card] : [])))
}

export const restActions = (actions: readonly HeroAction[]) =>
  actions.filter((a): a is Extract<HeroAction, { type: 'rest' }> => a.type === 'rest')
