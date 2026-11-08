// Mage deck from docs/rules-spec.md section 3.

import type { CardDefinition } from './cardTypes.ts'

export const mageDeck: readonly CardDefinition[] = [
  {
    id: 'mage-spark',
    name: 'Spark',
    halfA: { text: 'Attack 3, Range 3', burn: false },
    halfB: { text: 'Move 3', burn: false },
  },
  {
    id: 'mage-arcane-bolt',
    name: 'Arcane Bolt',
    halfA: { text: 'Attack 5, Range 2', burn: false },
    halfB: { text: 'Shield 2', burn: false, shield: 2 },
  },
  {
    id: 'mage-fireball',
    name: 'Fireball',
    halfA: {
      text: 'Attack 3, Range 3, plus 1 damage to each other enemy adjacent to the target',
      burn: false,
    },
    halfB: { text: 'Move 2', burn: false },
  },
  {
    id: 'mage-frost-snare',
    name: 'Frost Snare',
    halfA: { text: 'Attack 1, Range 3, Freeze the target', burn: false },
    halfB: { text: 'Move 2', burn: false },
  },
  {
    id: 'mage-force-push',
    name: 'Force Push',
    halfA: { text: 'Push 2 (enemy within 3), then Attack 1', burn: false },
    halfB: { text: 'Shield 2', burn: false, shield: 2 },
  },
  {
    id: 'mage-ward',
    name: 'Ward',
    halfA: { text: 'Shield 2', burn: false, shield: 2 },
    halfB: { text: 'Attack 2, Range 2', burn: false },
  },
  {
    id: 'mage-mend',
    name: 'Mend',
    halfA: { text: 'Heal 3', burn: false },
    halfB: { text: 'Move 2', burn: false },
  },
  {
    id: 'mage-meteor',
    name: 'Meteor',
    halfA: { text: 'Attack 3 to the target and all enemies adjacent to it, Range 4', burn: true },
    halfB: { text: 'Move 2', burn: false },
  },
  {
    id: 'mage-arcane-recall',
    name: 'Arcane Recall',
    halfA: { text: 'Return 2 cards from your discard to your hand', burn: true },
    halfB: { text: 'Attack 1, Range 3', burn: false },
  },
  {
    id: 'mage-barrier',
    name: 'Barrier',
    halfA: { text: 'Shield 3', burn: true, shield: 3 },
    halfB: { text: 'Move 2', burn: false },
  },
]
