// What the hero can do on a play: cards (either half, or the generic actions), and resting.
// Everything here is checked: an illegal action returns { ok: false, reason } and changes nothing.

import { applyDamage, applyHeal, damageToMonster } from './combat.ts'
import type { Effect } from './data/cardTypes.ts'
import { monsterStats } from './data/monsters.ts'
import type { Pos } from './data/scenarioTypes.ts'
import { canRest, playCard, rest, returnFromDiscard } from './deck.ts'
import { ignoreEvents, type EventSink, type GameEvent } from './events.ts'
import {
  currentShield,
  findMonster,
  isOccupied,
  maxHealth,
  replaceMonster,
  targetableMonsters,
  withResultIfOver,
  type GameContext,
  type GameState,
  type MonsterState,
} from './gameState.ts'
import { manhattan, posKey, samePos, shortestPaths, terrainAt } from './grid.ts'

/** The choices a player makes along with a card. Which ones matter depends on the card. */
export interface PlayChoices {
  /** Where to end a Move. Leave out to stay put. */
  readonly to?: Pos
  /** The enemy to attack or push (id from the scenario, such as 'G1'). */
  readonly target?: string
  /** Cleave: the second adjacent enemy. */
  readonly second?: string
  /** Push at a diagonal: which axis to push along. Only needed when the row and column distances are equal. */
  readonly axis?: 'row' | 'col'
  /** Arcane Recall: the discarded cards to take back. */
  readonly returns?: readonly string[]
}

/** 'A' and 'B' use a half of the card; the rest are the generic plays any card can make. */
export type PlayUse = 'A' | 'B' | 'move' | 'attack' | 'loot' | 'interact'

export type HeroAction =
  | ({ readonly type: 'play'; readonly card: string; readonly use: PlayUse } & PlayChoices)
  | { readonly type: 'rest'; readonly lose: string }
  | { readonly type: 'discard'; readonly card: string }

export type ActionResult =
  { readonly ok: true; readonly state: GameState } | { readonly ok: false; readonly reason: string }

const fail = (reason: string): ActionResult => ({ ok: false, reason })
const succeed = (state: GameState): ActionResult => ({ ok: true, state })

/**
 * Carry out one play or rest and nothing else: no monster phase, no end of round.
 * (`playAction` in round.ts adds those.) Useful on its own for a bot that looks one play ahead.
 */
export function performAction(
  context: GameContext,
  state: GameState,
  action: HeroAction,
  log: EventSink = ignoreEvents,
): ActionResult {
  // Hold the events back until the action has succeeded: a refused action changes nothing.
  const events: GameEvent[] = []
  const result = performChecked(context, state, action, (event) => events.push(event))
  if (result.ok) events.forEach(log)
  return result
}

function performChecked(
  context: GameContext,
  state: GameState,
  action: HeroAction,
  log: EventSink,
): ActionResult {
  if (state.phase !== 'play') return fail('The game is not waiting for a play')
  if (action.type === 'rest') return performRest(context, state, action.lose, log)
  if (action.type === 'discard') return fail('Discarding is only for Frightening Roar')

  const card = context.cardsById.get(action.card)
  if (!card || !state.deck.hand.includes(action.card)) {
    return fail(`${action.card} is not in your hand`)
  }

  const generic = action.use !== 'A' && action.use !== 'B'
  const half = action.use === 'A' ? card.halfA : card.halfB
  let current: GameState = {
    ...state,
    playsDone: state.playsDone + 1,
    deck: playCard(state.deck, card, generic ? 'generic' : action.use === 'A' ? 'A' : 'B'),
  }
  log({ kind: 'played', card: card.id, use: action.use, burned: !generic && half.burn })
  if (!generic && half.shield !== undefined) {
    log({ kind: 'shieldShown', card: card.id, value: half.shield, shield: currentShield(current) })
  }

  if (action.use === 'loot') return lootChest(context, current, log)
  if (action.use === 'interact') return interactWithDoor(context, current, log)

  const effects: readonly Effect[] =
    action.use === 'move' || action.use === 'attack'
      ? genericEffects(context, action.use)
      : half.effects
  for (const effect of effects) {
    const result = applyEffect(context, current, effect, action, log)
    if (!result.ok) return result
    current = withResultIfOver(result.state)
    if (current.result) break
  }
  return succeed(current)
}

/** What a generic Move or Attack play does. (Loot and Interact have no effects; they are handled separately.) */
export function genericEffects(context: GameContext, use: 'move' | 'attack'): Effect[] {
  if (use === 'move') return [{ kind: 'move', distance: context.generic.moveDistance }]
  return [
    { kind: 'attack', damage: context.generic.attackDamage, range: context.generic.attackRange },
  ]
}

function performRest(
  context: GameContext,
  state: GameState,
  lose: string,
  log: EventSink,
): ActionResult {
  if (state.restsThisRound >= context.roundRules.maxRestsPerRound) {
    return fail('You can only rest once per round')
  }
  if (!canRest(state.deck, context.deckRules))
    return fail('Resting needs more cards in the discard pile')
  if (!state.deck.discard.includes(lose)) return fail(`${lose} is not in the discard pile`)
  const rested = rest(state.deck, lose, state.random, context.deckRules, context.shuffleHero)
  log({
    kind: 'rested',
    lost: lose,
    shuffled: state.deck.drawPile.length + state.deck.discard.length - 1,
    drew: rested.deck.hand.length - state.deck.hand.length,
  })
  return succeed({
    ...state,
    deck: rested.deck,
    random: rested.random,
    playsDone: state.playsDone + 1,
    restsThisRound: state.restsThisRound + 1,
  })
}

function lootChest(context: GameContext, state: GameState, log: EventSink): ActionResult {
  if (state.looted) return fail('The chest is already looted')
  if (manhattan(state.position, context.scenario.chest) !== 1) {
    return fail('You must be next to the chest to loot it')
  }
  const heal = context.rules.chestPotionHeal
  const health = applyHeal(state.health, heal, maxHealth(state))
  log({ kind: 'looted', heal, healthBefore: state.health, healthAfter: health })
  return succeed(withResultIfOver({ ...state, looted: true, health }))
}

function interactWithDoor(context: GameContext, state: GameState, log: EventSink): ActionResult {
  if (context.rules.doorOpensBy !== 'interact') return fail('The door opens by stepping onto it')
  if (state.doorOpen) return fail('The door is already open')
  if (manhattan(state.position, context.scenario.door) !== 1) {
    return fail('You must be next to the door to open it')
  }
  return succeed(openDoor(state, log))
}

/** Open the door and reveal what was behind it. Revealed monsters do not act until the next round. */
function openDoor(state: GameState, log: EventSink): GameState {
  log({
    kind: 'doorOpened',
    revealed: state.monsters.filter((m) => !m.revealed && m.health > 0).map((m) => m.id),
  })
  return {
    ...state,
    doorOpen: true,
    monsters: state.monsters.map((m) =>
      m.revealed ? m : { ...m, revealed: true, revealedOnRound: state.round },
    ),
  }
}

function applyEffect(
  context: GameContext,
  state: GameState,
  effect: Effect,
  choices: PlayChoices,
  log: EventSink,
): ActionResult {
  switch (effect.kind) {
    case 'move':
      return applyMove(context, state, effect.distance, choices.to, log)
    case 'attack':
      return applyAttack(state, effect, choices, log)
    case 'push':
      return applyPush(context, state, effect, choices, log)
    case 'heal': {
      const health = applyHeal(state.health, effect.amount, maxHealth(state))
      log({
        kind: 'healed',
        amount: effect.amount,
        healthBefore: state.health,
        healthAfter: health,
      })
      return succeed({ ...state, health })
    }
    case 'shield':
      // playCard already put the card face-up in the showing pile.
      return succeed(state)
    case 'returnCards': {
      const cards = choices.returns ?? []
      if (cards.length > effect.count)
        return fail(`You can take back at most ${effect.count} cards`)
      if (
        cards.some((id) => !state.deck.discard.includes(id)) ||
        new Set(cards).size !== cards.length
      ) {
        return fail('Those cards are not all in the discard pile')
      }
      if (cards.length > 0) log({ kind: 'cardsReturned', cards })
      return succeed({ ...state, deck: returnFromDiscard(state.deck, cards) })
    }
  }
}

function heroCanEnter(context: GameContext, state: GameState, pos: Pos): boolean {
  const terrain = terrainAt(context.board, pos)
  if (terrain === 'floor' || terrain === 'mud') return !isOccupied(state, pos)
  if (terrain === 'door') {
    const walkable = state.doorOpen || context.rules.doorOpensBy === 'step'
    return walkable && !isOccupied(state, pos)
  }
  return false
}

/** Spaces the hero could end a Move of `distance` on, with the cost of each. Includes the current space. */
export function heroReach(
  context: GameContext,
  state: GameState,
  distance: number,
): Map<number, number> {
  const paths = shortestPaths(
    context.board,
    state.position,
    (pos) => heroCanEnter(context, state, pos),
    state.doorOpen,
    context.rules.mudCost,
  )
  const reach = new Map<number, number>()
  for (const [key, cost] of paths.cost) if (cost <= distance) reach.set(key, cost)
  return reach
}

function applyMove(
  context: GameContext,
  state: GameState,
  distance: number,
  to: Pos | undefined,
  log: EventSink,
): ActionResult {
  if (!to || samePos(to, state.position)) return succeed(state)
  const cost = heroReach(context, state, distance).get(posKey(to))
  if (cost === undefined) return fail('That space is out of reach')
  log({ kind: 'heroMoved', from: state.position, to })
  const moved = { ...state, position: to }
  // Stepping onto the door opens it and ends the move.
  const opens = terrainAt(context.board, to) === 'door' && !state.doorOpen
  return succeed(opens ? openDoor(moved, log) : moved)
}

function targetInRange(
  state: GameState,
  id: string | undefined,
  range: number,
): MonsterState | string | undefined {
  if (id === undefined) return undefined
  const monster = findMonster(state, id)
  if (!monster || monster.health <= 0 || !monster.revealed) return `${id} cannot be targeted`
  if (manhattan(state.position, monster.pos) > range) return `${id} is out of range`
  return monster
}

function hurt(state: GameState, id: string, amount: number, log: EventSink): GameState {
  const monster = findMonster(state, id)
  if (!monster || monster.health <= 0) return state
  const armor = monsterStats[monster.kind].armor
  const damage = damageToMonster(amount, armor)
  const health = applyDamage(monster.health, damage)
  log({
    kind: 'monsterHit',
    monster: id,
    attack: amount,
    armor,
    damage,
    healthBefore: monster.health,
    healthAfter: health,
  })
  return replaceMonster(state, { ...monster, health })
}

/** Damage that ignores armor (Lava, a blocked push). */
function hurtIgnoringArmor(state: GameState, id: string, amount: number): GameState {
  const monster = findMonster(state, id)
  if (!monster || monster.health <= 0) return state
  return replaceMonster(state, { ...monster, health: applyDamage(monster.health, amount) })
}

type AttackEffect = Extract<Effect, { kind: 'attack' }>

function applyAttack(
  state: GameState,
  effect: AttackEffect,
  choices: PlayChoices,
  log: EventSink,
): ActionResult {
  let next = state

  if (effect.area === 'allAdjacent') {
    for (const monster of targetableMonsters(state)) {
      if (manhattan(state.position, monster.pos) <= effect.range) {
        next = hurt(next, monster.id, effect.damage, log)
      }
    }
    return succeed(next)
  }

  const target = targetInRange(state, choices.target, effect.range)
  if (target === undefined) return succeed(state) // No target chosen: the attack does nothing.
  if (typeof target === 'string') return fail(target)

  const targetPos = target.pos
  next = hurt(next, target.id, effect.damage, log)

  if (effect.also?.to === 'secondAdjacent' && choices.second !== undefined) {
    const second = targetInRange(state, choices.second, 1)
    if (typeof second === 'string') return fail(second)
    if (second === undefined || second.id === target.id)
      return fail('Pick a different second enemy')
    next = hurt(next, second.id, effect.also.damage, log)
  }
  if (effect.also?.to === 'adjacentToTarget') {
    for (const other of targetableMonsters(next)) {
      if (other.id !== target.id && manhattan(targetPos, other.pos) === 1) {
        next = hurt(next, other.id, effect.also.damage, log)
      }
    }
  }
  if (effect.freeze) {
    const after = findMonster(next, target.id)
    if (after && after.health > 0) {
      log({ kind: 'frozen', monster: target.id })
      next = replaceMonster(next, { ...after, frozen: true })
    }
  }
  return succeed(next)
}

function applyPush(
  context: GameContext,
  state: GameState,
  effect: Extract<Effect, { kind: 'push' }>,
  choices: PlayChoices,
  log: EventSink,
): ActionResult {
  const target = targetInRange(state, choices.target, effect.range)
  if (target === undefined) return succeed(state)
  if (typeof target === 'string') return fail(target)
  const live = findMonster(state, target.id)
  if (!live || live.health <= 0) return succeed(state) // Already dead: nothing to push.

  const rowDistance = live.pos.row - state.position.row
  const colDistance = live.pos.col - state.position.col
  let alongRow: boolean
  if (rowDistance === 0 || colDistance === 0) {
    alongRow = colDistance === 0
  } else if (Math.abs(rowDistance) === Math.abs(colDistance)) {
    if (choices.axis === undefined) return fail('Diagonal tie: choose the row or column axis')
    alongRow = choices.axis === 'row'
  } else {
    const longerIsRow = Math.abs(rowDistance) > Math.abs(colDistance)
    if (choices.axis !== undefined && (choices.axis === 'row') !== longerIsRow) {
      return fail('A diagonal push goes along the longer axis')
    }
    alongRow = longerIsRow
  }
  const step: Pos = alongRow
    ? { row: Math.sign(rowDistance), col: 0 }
    : { row: 0, col: Math.sign(colDistance) }

  let next = state
  let position = live.pos
  let blocked = false
  let lava = false
  let damage = 0
  for (let i = 0; i < effect.distance; i++) {
    const ahead: Pos = { row: position.row + step.row, col: position.col + step.col }
    const terrain = terrainAt(context.board, ahead)
    blocked =
      terrain === undefined ||
      terrain === 'rubble' ||
      terrain === 'chest' ||
      (terrain === 'door' && !state.doorOpen) ||
      isOccupied(next, ahead, live.id)
    if (blocked) {
      damage = context.rules.blockedPushDamage
      next = hurtIgnoringArmor(next, live.id, damage)
      break
    }
    position = ahead
    next = replaceMonster(next, { ...(findMonster(next, live.id) as MonsterState), pos: position })
    if (terrain === 'lava') {
      lava = true
      damage = context.rules.lavaDamage
      next = hurtIgnoringArmor(next, live.id, damage)
      break
    }
  }
  log({
    kind: 'pushed',
    monster: live.id,
    from: live.pos,
    to: position,
    blocked,
    lava,
    damage,
    healthBefore: live.health,
    healthAfter: (findMonster(next, live.id) as MonsterState).health,
  })
  return succeed(next)
}
