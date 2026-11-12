// The plays a bot considers. This is not every legal play: it is a pruned list (a few promising
// destinations per Move, every sensible target) so the bot can look at each one quickly.
// The order matters: when two plays score the same, the earlier one wins.

import type { Effect } from './data/cardTypes.ts'
import type { Pos } from './data/scenarioTypes.ts'
import { targetableMonsters, type GameContext, type GameState } from './gameState.ts'
import { manhattan, neighbours, posFromKey, posKey, terrainAt } from './grid.ts'
import { heroReach, type HeroAction, type PlayChoices, type PlayUse } from './heroActions.ts'

/** Spaces a Move of `distance` could usefully end on. Returned in row, then column order. */
export function moveDestinations(context: GameContext, state: GameState, distance: number): Pos[] {
  const reach = [...heroReach(context, state, distance).keys()].sort((a, b) => a - b)
  const chest = context.scenario.chest
  const chestSides = neighbours(chest).filter((p) => {
    const terrain = terrainAt(context.board, p)
    return terrain === 'mud' || terrain === 'floor'
  })
  const distanceToGoal = (key: number): number => {
    const pos = posFromKey(key)
    if (!state.doorOpen) return manhattan(pos, context.scenario.door)
    return Math.min(...chestSides.map((q) => manhattan(pos, q)))
  }

  const chosen = new Set<number>([posKey(state.position)])
  // The three spaces closest to the goal (the door, then the chest).
  const byGoal = [...reach].sort((a, b) => distanceToGoal(a) - distanceToGoal(b) || a - b)
  byGoal.slice(0, 3).forEach((key) => chosen.add(key))
  // Spaces next to a visible monster, and next to the chest.
  const visible = targetableMonsters(state).map((m) => m.pos)
  const reachSet = new Set(reach)
  for (const pos of visible) {
    for (const q of neighbours(pos)) if (reachSet.has(posKey(q))) chosen.add(posKey(q))
  }
  for (const q of neighbours(chest)) if (reachSet.has(posKey(q))) chosen.add(posKey(q))

  if (visible.length > 0) {
    const nearest = (key: number) => Math.min(...visible.map((p) => manhattan(posFromKey(key), p)))
    // The two spaces farthest from every monster (to back away).
    ;[...reach]
      .sort((a, b) => nearest(b) - nearest(a) || a - b)
      .slice(0, 2)
      .forEach((key) => chosen.add(key))
    // The three spaces best placed to fight: next to the monsters for a Warrior, three away for a Mage.
    const ideal = state.heroId === 'warrior' ? 1 : 3
    ;[...reach]
      .sort(
        (a, b) =>
          Math.abs(nearest(a) - ideal) - Math.abs(nearest(b) - ideal) ||
          manhattan(posFromKey(a), state.position) - manhattan(posFromKey(b), state.position) ||
          a - b,
      )
      .slice(0, 3)
      .forEach((key) => chosen.add(key))
  }
  return [...chosen].sort((a, b) => a - b).map(posFromKey)
}

/** Every combination of choices worth trying for one half of a card. */
function choicesFor(
  context: GameContext,
  state: GameState,
  effects: readonly Effect[],
): PlayChoices[] {
  const ids = targetableMonsters(state).map((m) => m.id)
  let combos: PlayChoices[] = [{}]
  for (const effect of effects) {
    const next: PlayChoices[] = []
    if (effect.kind === 'move') {
      for (const choice of combos) {
        for (const to of moveDestinations(context, state, effect.distance))
          next.push({ ...choice, to })
      }
    } else if (effect.kind === 'attack' && effect.area === 'allAdjacent') {
      const anyAdjacent = targetableMonsters(state).some(
        (m) => manhattan(state.position, m.pos) <= effect.range,
      )
      if (anyAdjacent) next.push(...combos)
    } else if (effect.kind === 'attack') {
      for (const choice of combos) {
        if (choice.target !== undefined) {
          next.push(choice)
          continue
        }
        for (const target of ids) {
          next.push({ ...choice, target })
          if (effect.also?.to === 'secondAdjacent') {
            for (const second of ids.filter((id) => id !== target)) {
              next.push({ ...choice, target, second })
            }
          }
        }
      }
    } else if (effect.kind === 'push') {
      for (const choice of combos) {
        for (const target of choice.target !== undefined ? [choice.target] : ids) {
          next.push({ ...choice, target })
          next.push({ ...choice, target, axis: 'row' })
          next.push({ ...choice, target, axis: 'col' })
        }
      }
    } else if (effect.kind === 'returnCards') {
      const count = Math.min(effect.count, state.deck.discard.length)
      const sets = uniqueCombinations([...state.deck.discard].sort(), count)
      for (const choice of combos) {
        for (const returns of sets) next.push({ ...choice, returns })
      }
    } else {
      next.push(...combos)
    }
    combos = next
  }
  return combos
}

function uniqueCombinations(items: readonly string[], size: number): string[][] {
  const found = new Map<string, string[]>()
  const walk = (start: number, picked: string[]) => {
    if (picked.length === size) {
      found.set(picked.join('|'), [...picked])
      return
    }
    for (let i = start; i < items.length; i++) walk(i + 1, [...picked, items[i]])
  }
  walk(0, [])
  return [...found.values()]
}

/** The plays and rests a bot considers from this state. */
export function candidateActions(context: GameContext, state: GameState): HeroAction[] {
  const actions: HeroAction[] = []
  const discards = [...new Set(state.deck.discard)].sort()
  const rests: HeroAction[] =
    state.deck.discard.length >= context.deckRules.minDiscardToRest
      ? discards.map((lose) => ({ type: 'rest', lose }))
      : []
  if (state.deck.hand.length === 0) return rests

  const visible = targetableMonsters(state)
  const nextToChest = manhattan(state.position, context.scenario.chest) === 1 && !state.looted
  const nextToDoor =
    context.rules.doorOpensBy === 'interact' &&
    !state.doorOpen &&
    manhattan(state.position, context.scenario.door) === 1

  for (const cardId of [...new Set(state.deck.hand)].sort()) {
    const card = context.cardsById.get(cardId)
    if (!card) continue
    for (const use of ['A', 'B'] as const) {
      const half = use === 'A' ? card.halfA : card.halfB
      for (const choices of choicesFor(context, state, half.effects)) {
        actions.push({ type: 'play', card: cardId, use, ...choices })
      }
    }
    const hasMove = [card.halfA, card.halfB].some((half) =>
      half.effects.some((e) => e.kind === 'move' && e.distance >= 2),
    )
    if (!hasMove) {
      for (const to of moveDestinations(context, state, context.generic.moveDistance)) {
        actions.push({ type: 'play', card: cardId, use: 'move', to })
      }
    }
    for (const monster of visible) {
      if (manhattan(state.position, monster.pos) === 1) {
        actions.push({ type: 'play', card: cardId, use: 'attack', target: monster.id })
      }
    }
    if (nextToChest) actions.push({ type: 'play', card: cardId, use: 'loot' as PlayUse })
    if (nextToDoor) actions.push({ type: 'play', card: cardId, use: 'interact' as PlayUse })
  }
  return [...actions, ...rests]
}
