// The monster phase: flip one shared enemy card and resolve it (rules-spec sections 7 and 8).

import { applyDamage, damageToHero } from './combat.ts'
import type { EnemyCardDefinition } from './data/enemyDeck.ts'
import { monsterStats } from './data/monsters.ts'
import type { Pos } from './data/scenarioTypes.ts'
import { clearShowing } from './deck.ts'
import { afterEnemyCardResolves, enemyAttackBonus, flipEnemyCard } from './enemyDeck.ts'
import { ignoreEvents, type EventSink } from './events.ts'
import {
  actingMonsters,
  aliveMonsters,
  currentShield,
  findMonster,
  heroTerrain,
  isOccupied,
  replaceMonster,
  withResultIfOver,
  type GameContext,
  type GameState,
  type MonsterState,
} from './gameState.ts'
import { manhattan, neighbours, pathTo, posKey, shortestPaths, terrainAt } from './grid.ts'

/**
 * Flip the next enemy card and resolve it. Does nothing, and flips nothing, if no monster can act.
 * Afterwards frozen monsters thaw and shields showing on the hero's side are cleared.
 * `forcedCardId` resolves that card instead of flipping one; the deck and random state stay as they were.
 * A bot uses it to ask "what if the next card were this one?".
 */
export function runMonsterPhase(
  context: GameContext,
  state: GameState,
  forcedCardId?: string,
  log: EventSink = ignoreEvents,
): GameState {
  if (state.result) return state
  const acting = actingMonsters(state)
  if (acting.length === 0) {
    log({ kind: 'noMonsterPhase' })
    return state
  }

  let current = state
  let card: EnemyCardDefinition
  if (forcedCardId !== undefined) {
    card = findEnemyCard(context, forcedCardId)
    log({ kind: 'enemyCardFlipped', card: card.id, deckRefilled: false })
  } else {
    const flipped = flipEnemyCard(
      state.enemyDeck,
      context.enemyCards,
      state.random,
      context.shuffleEnemy,
    )
    card = flipped.card
    log({
      kind: 'enemyCardFlipped',
      card: card.id,
      deckRefilled: state.enemyDeck.drawPile.length === 0,
    })
    const settled = afterEnemyCardResolves(flipped.deck, card, flipped.random, context.shuffleEnemy)
    current = { ...state, enemyDeck: settled.deck, random: settled.random }
  }

  current = resolveEnemyCard(context, current, card, acting, log)
  if (card.reshuffle && forcedCardId === undefined) log({ kind: 'enemyDeckReshuffled' })

  const showing = current.deck.showing
  if (showing.length > 0) {
    log({
      kind: 'shieldsCleared',
      discarded: showing.filter((s) => !s.burned).map((s) => s.cardId),
      lost: showing.filter((s) => s.burned).map((s) => s.cardId),
    })
  }
  return {
    ...current,
    monsters: current.monsters.map((m) => (m.frozen ? { ...m, frozen: false } : m)),
    deck: clearShowing(current.deck),
  }
}

function findEnemyCard(context: GameContext, id: string): EnemyCardDefinition {
  const card = context.enemyCards.find((c) => c.id === id)
  if (!card) throw new Error(`Unknown enemy card "${id}"`)
  return card
}

function resolveEnemyCard(
  context: GameContext,
  state: GameState,
  card: EnemyCardDefinition,
  acting: readonly MonsterState[],
  log: EventSink,
): GameState {
  let current = state
  const actors = actorsFor(card, acting, state)
  const bonus = enemyAttackBonus(card, context.rules)

  for (const actor of actors) {
    if (current.result) break
    // A monster moves once, then makes all of its attacks.
    if (card.moves) current = moveMonster(context, current, actor.id, card.moveBonus, log)
    for (let i = 0; i < card.attacks && !current.result; i++) {
      current = attackHero(context, current, actor.id, bonus, log)
    }
  }

  if (card.mudDamage && heroTerrain(context, current) === 'mud' && !current.result) {
    const damage = context.rules.toxicFumesDamage
    const health = applyDamage(current.health, damage)
    log({ kind: 'toxicFumes', damage, healthBefore: current.health, healthAfter: health })
    current = withResultIfOver({ ...current, health })
  }
  return current
}

function actorsFor(
  card: EnemyCardDefinition,
  acting: readonly MonsterState[],
  state: GameState,
): readonly MonsterState[] {
  switch (card.actors) {
    case 'all':
    case 'melee': // Every monster in Scenario 1 is melee.
      return acting
    case 'adjacent':
      return acting.filter((m) => manhattan(m.pos, state.position) === 1)
    case 'closest':
      return acting.slice(0, 1)
    case 'none':
      return []
  }
}

/** Move toward the hero by the cheapest route, as far as the movement budget allows. */
function moveMonster(
  context: GameContext,
  state: GameState,
  id: string,
  moveBonus: number,
  log: EventSink,
): GameState {
  const monster = findMonster(state, id)
  if (!monster || monster.health <= 0) return state
  if (manhattan(monster.pos, state.position) === 1) return state
  if (monster.frozen) {
    log({ kind: 'monsterFrozenInPlace', monster: id })
    return state
  }

  const paths = shortestPaths(
    context.board,
    monster.pos,
    (pos) => {
      const terrain = terrainAt(context.board, pos)
      if (terrain === 'door') return state.doorOpen && !isOccupied(state, pos, id)
      return (terrain === 'floor' || terrain === 'mud') && !isOccupied(state, pos, id)
    },
    state.doorOpen,
    context.rules.mudCost,
  )

  // Go to the cheapest space next to the hero; ties go to the lowest row, then column.
  const goals = neighbours(state.position).filter((p) => paths.cost.has(posKey(p)))
  if (goals.length === 0) return state
  const goal = goals.reduce((best, p) => {
    const diff = (paths.cost.get(posKey(p)) ?? 0) - (paths.cost.get(posKey(best)) ?? 0)
    return diff < 0 || (diff === 0 && posKey(p) < posKey(best)) ? p : best
  })

  const budget = monsterStats[monster.kind].move + moveBonus
  let spent = 0
  let stop: Pos = monster.pos
  for (const step of pathTo(paths, monster.pos, goal).slice(1)) {
    const cost = terrainAt(context.board, step) === 'mud' ? context.rules.mudCost : 1
    if (spent + cost > budget) break
    spent += cost
    stop = step
  }
  if (posKey(stop) !== posKey(monster.pos)) {
    log({ kind: 'monsterMoved', monster: id, from: monster.pos, to: stop })
  }
  return replaceMonster(state, { ...monster, pos: stop })
}

/** Attack the hero if adjacent. Damage is attack + card bonus (+ Pack Tactics), minus the hero's shield. */
function attackHero(
  context: GameContext,
  state: GameState,
  id: string,
  cardBonus: number,
  log: EventSink,
): GameState {
  const monster = findMonster(state, id)
  if (!monster || monster.health <= 0) return state
  if (manhattan(monster.pos, state.position) !== 1) {
    log({ kind: 'monsterOutOfReach', monster: id })
    return state
  }

  const packTactics =
    monster.kind === 'goblin' &&
    aliveMonsters(state).some(
      (other) =>
        other.id !== id && other.kind === 'goblin' && manhattan(other.pos, state.position) === 1,
    )
  const attack = monsterStats[monster.kind].attack
  const packBonus = packTactics ? context.rules.packTacticsBonus : 0
  const shield = currentShield(state)
  const damage = damageToHero({ attack, cardModifier: cardBonus, bonus: packBonus }, shield)
  const health = applyDamage(state.health, damage)
  log({
    kind: 'monsterAttacked',
    monster: id,
    attack,
    cardBonus,
    packTactics: packBonus,
    shield,
    damage,
    healthBefore: state.health,
    healthAfter: health,
  })
  return withResultIfOver({ ...state, health })
}
