// Mage deck from docs/rules-spec.md section 3.

import type { CardDefinition } from './cardTypes.ts'

export const mageDeck: readonly CardDefinition[] = [
  {
    id: 'mage-spark',
    name: 'Spark',
    halfA: {
      text: 'Attack 3, Range 3',
      burn: false,
      effects: [{ kind: 'attack', damage: 3, range: 3 }],
    },
    halfB: { text: 'Move 3', burn: false, effects: [{ kind: 'move', distance: 3 }] },
  },
  {
    id: 'mage-arcane-bolt',
    name: 'Arcane Bolt',
    halfA: {
      text: 'Attack 5, Range 2',
      burn: true,
      effects: [{ kind: 'attack', damage: 5, range: 2 }],
    },
    halfB: { text: 'Shield 2', burn: false, shield: 2, effects: [{ kind: 'shield', value: 2 }] },
  },
  {
    id: 'mage-fireball',
    name: 'Fireball',
    halfA: {
      text: 'Attack 3, Range 3, plus 1 damage to each other enemy adjacent to the target',
      burn: false,
      effects: [
        { kind: 'attack', damage: 3, range: 3, also: { to: 'adjacentToTarget', damage: 1 } },
      ],
    },
    halfB: { text: 'Move 2', burn: false, effects: [{ kind: 'move', distance: 2 }] },
  },
  {
    id: 'mage-frost-snare',
    name: 'Frost Snare',
    halfA: {
      text: 'Attack 1, Range 3, Freeze the target',
      burn: false,
      effects: [{ kind: 'attack', damage: 1, range: 3, freeze: true }],
    },
    halfB: { text: 'Move 2', burn: false, effects: [{ kind: 'move', distance: 2 }] },
  },
  {
    id: 'mage-force-push',
    name: 'Force Push',
    halfA: {
      text: 'Push 2 (enemy within 3), then Attack 1',
      burn: false,
      effects: [
        { kind: 'push', distance: 2, range: 3 },
        { kind: 'attack', damage: 1, range: 3 },
      ],
    },
    halfB: { text: 'Shield 2', burn: false, shield: 2, effects: [{ kind: 'shield', value: 2 }] },
  },
  {
    id: 'mage-ward',
    name: 'Ward',
    halfA: { text: 'Shield 2', burn: false, shield: 2, effects: [{ kind: 'shield', value: 2 }] },
    halfB: {
      text: 'Attack 2, Range 2',
      burn: false,
      effects: [{ kind: 'attack', damage: 2, range: 2 }],
    },
  },
  {
    id: 'mage-mend',
    name: 'Mend',
    halfA: { text: 'Heal 2', burn: false, effects: [{ kind: 'heal', amount: 2 }] },
    halfB: { text: 'Move 2', burn: false, effects: [{ kind: 'move', distance: 2 }] },
  },
  {
    id: 'mage-meteor',
    name: 'Meteor',
    halfA: {
      text: 'Attack 3 to the target and all enemies adjacent to it, Range 4',
      burn: true,
      effects: [
        { kind: 'attack', damage: 3, range: 4, also: { to: 'adjacentToTarget', damage: 3 } },
      ],
    },
    halfB: { text: 'Move 2', burn: false, effects: [{ kind: 'move', distance: 2 }] },
  },
  {
    id: 'mage-arcane-recall',
    name: 'Arcane Recall',
    halfA: {
      text: 'Return 2 cards from your discard to your hand',
      burn: true,
      effects: [{ kind: 'returnCards', count: 2 }],
    },
    halfB: {
      text: 'Attack 1, Range 3',
      burn: false,
      effects: [{ kind: 'attack', damage: 1, range: 3 }],
    },
  },
  {
    id: 'mage-barrier',
    name: 'Barrier',
    halfA: { text: 'Shield 3', burn: true, shield: 3, effects: [{ kind: 'shield', value: 3 }] },
    halfB: { text: 'Move 2', burn: false, effects: [{ kind: 'move', distance: 2 }] },
  },
]
