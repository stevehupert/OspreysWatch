// Every action the player may take right now, for the UI to offer.
//
// How it works: list every combination of choices a play could have, then keep only the ones
// performAction accepts. Because the engine itself does the checking, this list can never disagree
// with what the engine allows. (The bot uses its own, shorter list in botCandidates.ts.)
//
// Each play is listed once, in its simplest form:
// - A Move that stays put leaves out `to`.
// - A push names an `axis` only when it has to (a diagonal tie).
// - Parts of a half with nothing to act on are allowed and simply do nothing, for example Charge
//   moving with no enemy to hit (rules-spec open question 17).

import type { CardHalf, Effect } from './data/cardTypes.ts'
import { targetableMonsters, type GameContext, type GameState } from './gameState.ts'
import { posFromKey, posKey } from './grid.ts'
import {
  heroReach,
  performAction,
  type HeroAction,
  type PlayChoices,
  type PlayUse,
} from './heroActions.ts'

export function legalActions(context: GameContext, state: GameState): HeroAction[] {
  if (state.phase === 'over') return []
  if (state.phase === 'roar') {
    return unique(state.deck.hand).map((card) => ({ type: 'discard', card }))
  }

  const candidates: HeroAction[] = []
  for (const card of unique(state.deck.hand)) {
    const definition = context.cardsById.get(card)
    if (!definition) continue
    for (const [use, half] of [
      ['A', definition.halfA],
      ['B', definition.halfB],
    ] as const) {
      for (const choices of choicesForHalf(context, state, half)) {
        candidates.push({ type: 'play', card, use, ...choices })
      }
    }
    for (const to of [undefined, ...destinations(context, state, context.generic.moveDistance)]) {
      candidates.push(play(card, 'move', { to }))
    }
    for (const target of [undefined, ...monsterIds(state)]) {
      candidates.push(play(card, 'attack', { target }))
    }
    candidates.push(play(card, 'loot'), play(card, 'interact'))
  }
  for (const lose of unique(state.deck.discard)) candidates.push({ type: 'rest', lose })

  const legal = candidates.filter((action) => performAction(context, state, action).ok)
  return withoutNeedlessAxis(withoutDuplicates(legal))
}

/** A play action without the choices that were left undefined. */
function play(card: string, use: PlayUse, choices: PlayChoices = {}): HeroAction {
  const set = Object.entries(choices).filter(([, value]) => value !== undefined)
  return { type: 'play', card, use, ...Object.fromEntries(set) }
}

/** Every combination of choices for one card half, valid or not. performAction sorts them out. */
function choicesForHalf(context: GameContext, state: GameState, half: CardHalf): PlayChoices[] {
  let combos: PlayChoices[] = [{}]
  for (const effect of half.effects) {
    combos = combos.flatMap((choice) => extend(context, state, effect, choice))
  }
  return combos
}

function extend(
  context: GameContext,
  state: GameState,
  effect: Effect,
  choice: PlayChoices,
): PlayChoices[] {
  switch (effect.kind) {
    case 'move':
      return [
        choice,
        ...destinations(context, state, effect.distance).map((to) => ({ ...choice, to })),
      ]
    case 'attack': {
      // Sweep hits everyone adjacent; a later effect on the same card reuses an earlier target.
      if (effect.area === 'allAdjacent' || choice.target !== undefined) return [choice]
      const ids = monsterIds(state)
      const withTarget = ids.flatMap((target) => {
        const one = { ...choice, target }
        if (effect.also?.to !== 'secondAdjacent') return [one]
        return [one, ...ids.filter((id) => id !== target).map((second) => ({ ...one, second }))]
      })
      return [choice, ...withTarget]
    }
    case 'push': {
      const targets = choice.target !== undefined ? [choice.target] : monsterIds(state)
      const pushes = targets.flatMap((target) => [
        { ...choice, target },
        { ...choice, target, axis: 'row' as const },
        { ...choice, target, axis: 'col' as const },
      ])
      return choice.target !== undefined ? pushes : [choice, ...pushes]
    }
    case 'returnCards':
      return subsetsUpTo(unique(state.deck.discard), effect.count).map((returns) =>
        returns.length === 0 ? choice : { ...choice, returns },
      )
    case 'heal':
    case 'shield':
      return [choice]
  }
}

/**
 * Spaces a Move could end on from where the hero stands now, not counting staying put.
 * (For Charge the attack is then checked from the new space by performAction.)
 */
function destinations(context: GameContext, state: GameState, distance: number) {
  const here = posKey(state.position)
  return [...heroReach(context, state, distance).keys()]
    .filter((key) => key !== here)
    .sort((a, b) => a - b)
    .map(posFromKey)
}

const monsterIds = (state: GameState): string[] => targetableMonsters(state).map((m) => m.id)

/** Drop a push that names an axis when the same play without the axis is also legal. */
function withoutNeedlessAxis(actions: HeroAction[]): HeroAction[] {
  const keys = new Set(actions.map(actionKey))
  return actions.filter((action) => {
    if (action.type !== 'play' || action.axis === undefined) return true
    const { axis: _axis, ...withoutAxis } = action
    return !keys.has(actionKey(withoutAxis))
  })
}

/** A stable text form of an action (keys sorted at every level), for comparing two actions. */
export function actionKey(action: HeroAction): string {
  const sorted = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(sorted)
    if (value === null || typeof value !== 'object') return value
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, v]) => v !== undefined)
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([k, v]) => [k, sorted(v)]),
    )
  }
  return JSON.stringify(sorted(action))
}

/** Keep the first of any actions that are the same. */
function withoutDuplicates(actions: HeroAction[]): HeroAction[] {
  const seen = new Set<string>()
  return actions.filter((action) => {
    const key = actionKey(action)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function unique(ids: readonly string[]): string[] {
  return [...new Set(ids)].sort()
}

/** Every subset of `items` with at most `size` members, the empty one included. */
function subsetsUpTo(items: readonly string[], size: number): string[][] {
  const result: string[][] = []
  const walk = (start: number, picked: string[]) => {
    result.push(picked)
    if (picked.length === size) return
    for (let i = start; i < items.length; i++) walk(i + 1, [...picked, items[i]])
  }
  walk(0, [])
  return result
}
