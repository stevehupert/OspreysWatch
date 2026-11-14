// Warrior deck from docs/rules-spec.md section 3.

import type { CardDefinition } from './cardTypes.ts'

export const warriorDeck: readonly CardDefinition[] = [
  {
    id: 'warrior-cleave',
    name: 'Cleave',
    halfA: {
      text: 'Attack 2, plus 1 damage to a second adjacent enemy',
      burn: false,
      effects: [{ kind: 'attack', damage: 2, range: 1, also: { to: 'secondAdjacent', damage: 1 } }],
    },
    halfB: { text: 'Move 3', burn: false, effects: [{ kind: 'move', distance: 3 }] },
  },
  {
    id: 'warrior-quick-strike',
    name: 'Quick Strike',
    halfA: { text: 'Attack 3', burn: false, effects: [{ kind: 'attack', damage: 3, range: 1 }] },
    halfB: { text: 'Move 3', burn: false, effects: [{ kind: 'move', distance: 3 }] },
  },
  {
    id: 'warrior-sweep',
    name: 'Sweep',
    halfA: {
      text: 'Attack 2 to ALL adjacent enemies',
      burn: false,
      effects: [{ kind: 'attack', damage: 2, range: 1, area: 'allAdjacent' }],
    },
    halfB: { text: 'Move 3', burn: false, effects: [{ kind: 'move', distance: 3 }] },
  },
  {
    id: 'warrior-shield-bash',
    name: 'Shield Bash',
    halfA: {
      text: 'Attack 2, Push 1',
      burn: false,
      effects: [
        { kind: 'attack', damage: 2, range: 1 },
        { kind: 'push', distance: 1, range: 1 },
      ],
    },
    halfB: { text: 'Shield 2', burn: false, shield: 2, effects: [{ kind: 'shield', value: 2 }] },
  },
  {
    id: 'warrior-hold-the-line',
    name: 'Hold the Line',
    halfA: {
      text: 'Shield 2 and Heal 1',
      burn: false,
      shield: 2,
      effects: [
        { kind: 'shield', value: 2 },
        { kind: 'heal', amount: 1 },
      ],
    },
    halfB: { text: 'Attack 2', burn: false, effects: [{ kind: 'attack', damage: 2, range: 1 }] },
  },
  {
    id: 'warrior-guard-stance',
    name: 'Guard Stance',
    halfA: {
      text: 'Shield 1 and Attack 2',
      burn: false,
      shield: 1,
      effects: [
        { kind: 'shield', value: 1 },
        { kind: 'attack', damage: 2, range: 1 },
      ],
    },
    halfB: { text: 'Move 3', burn: false, effects: [{ kind: 'move', distance: 3 }] },
  },
  {
    id: 'warrior-second-wind',
    name: 'Second Wind',
    halfA: { text: 'Heal 3', burn: false, effects: [{ kind: 'heal', amount: 3 }] },
    halfB: { text: 'Move 3', burn: false, effects: [{ kind: 'move', distance: 3 }] },
  },
  {
    id: 'warrior-charge',
    name: 'Charge',
    halfA: {
      text: 'Move 3, then Attack 2',
      burn: false,
      effects: [
        { kind: 'move', distance: 3 },
        { kind: 'attack', damage: 2, range: 1 },
      ],
    },
    halfB: { text: 'Move 3', burn: false, effects: [{ kind: 'move', distance: 3 }] },
  },
  {
    id: 'warrior-heavy-blow',
    name: 'Heavy Blow',
    halfA: { text: 'Attack 5', burn: true, effects: [{ kind: 'attack', damage: 5, range: 1 }] },
    halfB: { text: 'Move 3', burn: false, effects: [{ kind: 'move', distance: 3 }] },
  },
  {
    id: 'warrior-last-stand',
    name: 'Last Stand',
    halfA: {
      text: 'Heal 3 and Shield 2',
      burn: true,
      shield: 2,
      effects: [
        { kind: 'heal', amount: 3 },
        { kind: 'shield', value: 2 },
      ],
    },
    halfB: { text: 'Attack 2', burn: false, effects: [{ kind: 'attack', damage: 2, range: 1 }] },
  },
]
