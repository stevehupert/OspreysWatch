// Warrior deck from docs/rules-spec.md section 3.

import type { CardDefinition } from './cardTypes.ts'

export const warriorDeck: readonly CardDefinition[] = [
  {
    id: 'warrior-cleave',
    name: 'Cleave',
    halfA: { text: 'Attack 2, plus 1 damage to a second adjacent enemy', burn: false },
    halfB: { text: 'Move 2', burn: false },
  },
  {
    id: 'warrior-quick-strike',
    name: 'Quick Strike',
    halfA: { text: 'Attack 3', burn: false },
    halfB: { text: 'Move 3', burn: false },
  },
  {
    id: 'warrior-sweep',
    name: 'Sweep',
    halfA: { text: 'Attack 2 to ALL adjacent enemies', burn: false },
    halfB: { text: 'Move 2', burn: false },
  },
  {
    id: 'warrior-shield-bash',
    name: 'Shield Bash',
    halfA: { text: 'Attack 2, Push 1', burn: false },
    halfB: { text: 'Shield 2', burn: false, shield: 2 },
  },
  {
    id: 'warrior-hold-the-line',
    name: 'Hold the Line',
    halfA: { text: 'Shield 2 and Heal 1', burn: false, shield: 2 },
    halfB: { text: 'Attack 2', burn: false },
  },
  {
    id: 'warrior-guard-stance',
    name: 'Guard Stance',
    halfA: { text: 'Shield 1 and Attack 2', burn: false, shield: 1 },
    halfB: { text: 'Move 2', burn: false },
  },
  {
    id: 'warrior-second-wind',
    name: 'Second Wind',
    halfA: { text: 'Heal 3', burn: false },
    halfB: { text: 'Move 2', burn: false },
  },
  {
    id: 'warrior-charge',
    name: 'Charge',
    halfA: { text: 'Move 3, then Attack 3', burn: true },
    halfB: { text: 'Move 3', burn: false },
  },
  {
    id: 'warrior-heavy-blow',
    name: 'Heavy Blow',
    halfA: { text: 'Attack 5', burn: true },
    halfB: { text: 'Move 2', burn: false },
  },
  {
    id: 'warrior-last-stand',
    name: 'Last Stand',
    halfA: { text: 'Heal 3 and Shield 2', burn: true, shield: 2 },
    halfB: { text: 'Attack 2', burn: false },
  },
]
