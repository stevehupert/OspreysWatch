// Sentences for the game log. The engine reports numbers; this file only puts them into words.

import type { GameEvent } from '../engine/events.ts'
import type { GameContext } from '../engine/gameState.ts'
import { cardById, enemyCardById, monsterName, spaceName } from './names.ts'

/** Which part of the round a line belongs to, for styling. */
export type LineKind = 'hero' | 'monsters' | 'round' | 'result'

export interface LogLine {
  readonly kind: LineKind
  readonly text: string
}

/** Describe a round's events in order. Attack lines name the enemy card that gave a bonus. */
export function describeEvents(context: GameContext, events: readonly GameEvent[]): LogLine[] {
  let enemyCard = ''
  return events.map((event) => {
    if (event.kind === 'enemyCardFlipped') enemyCard = enemyCardById(context, event.card).name
    return describe(context, event, enemyCard)
  })
}

const health = (before: number, after: number) => `Health ${before} → ${after}.`

function describe(context: GameContext, event: GameEvent, enemyCard: string): LogLine {
  const hero = (text: string): LogLine => ({ kind: 'hero', text })
  const monsters = (text: string): LogLine => ({ kind: 'monsters', text })
  const card = (id: string) => cardById(context, id).name
  const monster = (id: string) => monsterName(context, id)
  const Monster = (id: string) => capitalize(monster(id))

  switch (event.kind) {
    case 'played': {
      const definition = cardById(context, event.card)
      const burns = event.burned ? ' It burns: lost for the rest of the scenario.' : ''
      switch (event.use) {
        case 'A':
        case 'B': {
          const half = event.use === 'A' ? definition.halfA : definition.halfB
          return hero(
            `You play ${definition.name}, half ${event.use}: ${sentence(half.text)}${burns}`,
          )
        }
        case 'move':
          return hero(`You play ${definition.name} as Move ${context.generic.moveDistance}.`)
        case 'attack':
          return hero(`You play ${definition.name} as Attack ${context.generic.attackDamage}.`)
        case 'loot':
          return hero(`You play ${definition.name} to loot the chest.`)
        case 'interact':
          return hero(`You play ${definition.name} to open the door.`)
      }
    }
    case 'heroMoved':
      return hero(`You move from ${spaceName(event.from)} to ${spaceName(event.to)}.`)
    case 'doorOpened': {
      const appear = event.revealed.map((id) => ` ${Monster(id)} appears!`).join('')
      return hero(`The door opens.${appear}`)
    }
    case 'monsterHit': {
      const defeated = event.healthAfter === 0 ? ` ${Monster(event.monster)} is defeated.` : ''
      return hero(
        `You hit ${monster(event.monster)}: ${event.attack} − ${event.armor} (armor) = ` +
          `${event.damage} damage. ${health(event.healthBefore, event.healthAfter)}${defeated}`,
      )
    }
    case 'pushed': {
      const name = monster(event.monster)
      const defeated = event.healthAfter === 0 ? ` ${capitalize(name)} is defeated.` : ''
      if (event.blocked) {
        const moved = event.from.row !== event.to.row || event.from.col !== event.to.col
        return hero(
          `You push ${name}${moved ? ` to ${spaceName(event.to)}` : ''}, but it is blocked: ` +
            `${event.damage} damage (armor does not count). ` +
            `${health(event.healthBefore, event.healthAfter)}${defeated}`,
        )
      }
      if (event.lava) {
        return hero(
          `You push ${name} into the Lava at ${spaceName(event.to)}: ${event.damage} damage ` +
            `(armor does not count). ${health(event.healthBefore, event.healthAfter)}${defeated}`,
        )
      }
      return hero(`You push ${name} from ${spaceName(event.from)} to ${spaceName(event.to)}.`)
    }
    case 'frozen':
      return hero(`${Monster(event.monster)} is frozen: it cannot move in the next monster phase.`)
    case 'healed':
      return hero(`You heal ${event.amount}. ${health(event.healthBefore, event.healthAfter)}`)
    case 'shieldShown':
      return hero(
        `${card(event.card)} shows Shield ${event.value}. Your shield is ${event.shield}.`,
      )
    case 'cardsReturned':
      return hero(`You take back ${event.cards.map(card).join(' and ')}.`)
    case 'looted':
      return hero(
        `You loot the chest and drink the potion: heal ${event.heal}. ` +
          health(event.healthBefore, event.healthAfter),
      )
    case 'rested':
      return hero(
        `You rest: ${card(event.lost)} is lost for the rest of the scenario. ` +
          `${event.shuffled} cards are shuffled into your draw pile and you draw ${event.drew}.`,
      )

    case 'noMonsterPhase':
      return monsters('No monster can act, so no enemy card is flipped.')
    case 'enemyCardFlipped': {
      const flipped = enemyCardById(context, event.card)
      const refill = event.deckRefilled
        ? 'The enemy deck is empty, so its discard pile is shuffled into a new deck. '
        : ''
      return monsters(`${refill}Enemy card: ${sentence(flipped.name)} ${sentence(flipped.text)}`)
    }
    case 'monsterMoved':
      return monsters(
        `${Monster(event.monster)} moves from ${spaceName(event.from)} to ${spaceName(event.to)}.`,
      )
    case 'monsterFrozenInPlace':
      return monsters(`${Monster(event.monster)} is frozen and does not move.`)
    case 'monsterOutOfReach':
      return monsters(`${Monster(event.monster)} is not next to you, so it cannot attack.`)
    case 'monsterAttacked': {
      const parts = [`${event.attack}`]
      if (event.cardBonus !== 0) parts.push(`${signed(event.cardBonus)} (${enemyCard})`)
      if (event.packTactics !== 0) parts.push(`${signed(event.packTactics)} (Pack Tactics)`)
      parts.push(`− ${event.shield} (shield)`)
      return monsters(
        `${Monster(event.monster)} attacks you: ${parts.join(' ')} = ${event.damage} damage. ` +
          health(event.healthBefore, event.healthAfter),
      )
    }
    case 'toxicFumes':
      return monsters(
        `Toxic Fumes: you are on Mud and take ${event.damage} damage (shields do not count). ` +
          health(event.healthBefore, event.healthAfter),
      )
    case 'enemyDeckReshuffled':
      return monsters('Unleash Doom: the whole enemy deck is shuffled together again.')
    case 'shieldsCleared': {
      const parts = []
      if (event.discarded.length > 0)
        parts.push(`${event.discarded.map(card).join(' and ')} to your discard pile`)
      if (event.lost.length > 0) parts.push(`${event.lost.map(card).join(' and ')} lost (burned)`)
      return monsters(`Your shield cards are cleared: ${parts.join('; ')}.`)
    }

    case 'roarDiscard':
      return { kind: 'round', text: `Frightening Roar: you discard ${card(event.card)}.` }
    case 'roundEnded':
      return {
        kind: 'round',
        text: `Round ${event.round} ends. You draw ${event.drew} card${event.drew === 1 ? '' : 's'}.`,
      }
    case 'gameOver':
      return {
        kind: 'result',
        text:
          event.result === 'victory'
            ? 'Victory! Every monster is defeated and the chest is looted.'
            : event.result === 'defeat-health'
              ? 'Defeat: you are out of health.'
              : 'Defeat: you are out of cards.',
      }
  }
}

const signed = (n: number) => (n < 0 ? `− ${-n}` : `+ ${n}`)
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)
/** End a name or text with a full stop, unless it already ends with one (or with ! or ?). */
const sentence = (text: string) => (/[.!?]$/.test(text) ? text : `${text}.`)
