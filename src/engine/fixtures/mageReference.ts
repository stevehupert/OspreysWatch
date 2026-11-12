// A reference game recorded from the Python simulator used to design Scenario 1 (rules-spec v0.7).
// It lists every play a perfect-foresight search made, the shuffles that happened (scripted, so the
// replay does not depend on any random generator), and the game state after each round.
// Cards and enemy cards are named as printed. Do not edit by hand: regenerate from the simulator.

import type { ReferenceGame } from './referenceGameTypes.ts'

export const mageReference: ReferenceGame = {
  name: 'mage-seed-1',
  hero: 'mage',
  deal: [
    'Mend',
    'Arcane Recall',
    'Barrier',
    'Meteor',
    'Ward',
    'Frost Snare',
    'Spark',
    'Force Push',
    'Arcane Bolt',
    'Fireball',
  ],
  enemyOrder: [
    'Frenzy',
    'Toxic Fumes',
    'Skirmish',
    'Regroup',
    'Advance',
    'Advance',
    'Skirmish',
    'Unleash Doom',
    'Advance',
    'Skirmish',
    'Skirmish',
    'Flanked',
    'Advance',
    'Unleash Doom',
    'Enrage',
  ],
  flipsUsed: [
    'Frenzy',
    'Toxic Fumes',
    'Skirmish',
    'Regroup',
    'Advance',
    'Advance',
    'Skirmish',
    'Unleash Doom',
    'Advance',
    'Skirmish',
    'Skirmish',
  ],
  heroShuffles: [
    ['Frost Snare', 'Ward', 'Fireball', 'Mend', 'Spark', 'Force Push'],
    ['Ward', 'Fireball', 'Force Push', 'Mend', 'Spark'],
  ],
  enemyShuffles: [
    [
      'Advance',
      'Skirmish',
      'Skirmish',
      'Advance',
      'Advance',
      'Advance',
      'Enrage',
      'Flanked',
      'Frenzy',
      'Regroup',
      'Skirmish',
      'Skirmish',
      'Toxic Fumes',
      'Unleash Doom',
      'Unleash Doom',
    ],
  ],
  rounds: [
    {
      actions: [
        {
          type: 'play',
          card: 'Meteor',
          use: 'A',
          target: 'G2',
        },
        {
          type: 'play',
          card: 'Barrier',
          use: 'B',
          to: {
            row: 3,
            col: 3,
          },
        },
      ],
      after: {
        round: 2,
        result: null,
        hp: 7,
        pos: {
          row: 3,
          col: 3,
        },
        doorOpen: false,
        looted: false,
        monsters: {
          G1: {
            pos: {
              row: 2,
              col: 4,
            },
            hp: 4,
            revealed: true,
          },
          G2: {
            pos: {
              row: 4,
              col: 4,
            },
            hp: 1,
            revealed: true,
          },
          G3: {
            pos: {
              row: 2,
              col: 6,
            },
            hp: 4,
            revealed: true,
          },
          O: {
            pos: {
              row: 4,
              col: 11,
            },
            hp: 10,
            revealed: false,
          },
        },
        hand: ['Arcane Recall', 'Frost Snare', 'Mend', 'Spark', 'Ward'],
        draw: ['Force Push', 'Arcane Bolt', 'Fireball'],
        discard: ['Barrier'],
        lost: ['Meteor'],
        showing: [],
      },
    },
    {
      actions: [
        {
          type: 'play',
          card: 'Frost Snare',
          use: 'A',
          target: 'G2',
        },
        {
          type: 'play',
          card: 'Spark',
          use: 'B',
          to: {
            row: 4,
            col: 4,
          },
        },
      ],
      after: {
        round: 3,
        result: null,
        hp: 7,
        pos: {
          row: 4,
          col: 4,
        },
        doorOpen: false,
        looted: false,
        monsters: {
          G1: {
            pos: {
              row: 2,
              col: 4,
            },
            hp: 4,
            revealed: true,
          },
          G2: {
            pos: {
              row: 4,
              col: 4,
            },
            hp: 0,
            revealed: true,
          },
          G3: {
            pos: {
              row: 2,
              col: 6,
            },
            hp: 4,
            revealed: true,
          },
          O: {
            pos: {
              row: 4,
              col: 11,
            },
            hp: 10,
            revealed: false,
          },
        },
        hand: ['Arcane Bolt', 'Arcane Recall', 'Force Push', 'Mend', 'Ward'],
        draw: ['Fireball'],
        discard: ['Barrier', 'Frost Snare', 'Spark'],
        lost: ['Meteor'],
        showing: [],
      },
    },
    {
      actions: [
        {
          type: 'play',
          card: 'Arcane Bolt',
          use: 'A',
          target: 'G1',
        },
        {
          type: 'play',
          card: 'Force Push',
          use: 'move',
          to: {
            row: 4,
            col: 6,
          },
        },
      ],
      after: {
        round: 4,
        result: null,
        hp: 7,
        pos: {
          row: 4,
          col: 6,
        },
        doorOpen: false,
        looted: false,
        monsters: {
          G1: {
            pos: {
              row: 2,
              col: 4,
            },
            hp: 0,
            revealed: true,
          },
          G2: {
            pos: {
              row: 4,
              col: 4,
            },
            hp: 0,
            revealed: true,
          },
          G3: {
            pos: {
              row: 2,
              col: 6,
            },
            hp: 4,
            revealed: true,
          },
          O: {
            pos: {
              row: 4,
              col: 11,
            },
            hp: 10,
            revealed: false,
          },
        },
        hand: ['Arcane Recall', 'Fireball', 'Mend', 'Ward'],
        draw: [],
        discard: ['Barrier', 'Force Push', 'Frost Snare', 'Spark'],
        lost: ['Arcane Bolt', 'Meteor'],
        showing: [],
      },
    },
    {
      actions: [
        {
          type: 'play',
          card: 'Mend',
          use: 'B',
          to: {
            row: 3,
            col: 7,
          },
        },
        {
          type: 'play',
          card: 'Fireball',
          use: 'A',
          target: 'G3',
        },
      ],
      after: {
        round: 5,
        result: null,
        hp: 7,
        pos: {
          row: 3,
          col: 7,
        },
        doorOpen: true,
        looted: false,
        monsters: {
          G1: {
            pos: {
              row: 2,
              col: 4,
            },
            hp: 0,
            revealed: true,
          },
          G2: {
            pos: {
              row: 4,
              col: 4,
            },
            hp: 0,
            revealed: true,
          },
          G3: {
            pos: {
              row: 2,
              col: 6,
            },
            hp: 1,
            revealed: true,
          },
          O: {
            pos: {
              row: 4,
              col: 11,
            },
            hp: 10,
            revealed: true,
          },
        },
        hand: ['Arcane Recall', 'Ward'],
        draw: [],
        discard: ['Barrier', 'Fireball', 'Force Push', 'Frost Snare', 'Mend', 'Spark'],
        lost: ['Arcane Bolt', 'Meteor'],
        showing: [],
      },
    },
    {
      actions: [
        {
          type: 'play',
          card: 'Ward',
          use: 'B',
          target: 'G3',
        },
        {
          type: 'play',
          card: 'Arcane Recall',
          use: 'A',
          returns: ['Fireball', 'Spark'],
        },
      ],
      after: {
        round: 6,
        result: null,
        hp: 7,
        pos: {
          row: 3,
          col: 7,
        },
        doorOpen: true,
        looted: false,
        monsters: {
          G1: {
            pos: {
              row: 2,
              col: 4,
            },
            hp: 0,
            revealed: true,
          },
          G2: {
            pos: {
              row: 4,
              col: 4,
            },
            hp: 0,
            revealed: true,
          },
          G3: {
            pos: {
              row: 2,
              col: 6,
            },
            hp: 0,
            revealed: true,
          },
          O: {
            pos: {
              row: 2,
              col: 10,
            },
            hp: 10,
            revealed: true,
          },
        },
        hand: ['Fireball', 'Spark'],
        draw: [],
        discard: ['Barrier', 'Force Push', 'Frost Snare', 'Mend', 'Ward'],
        lost: ['Arcane Bolt', 'Arcane Recall', 'Meteor'],
        showing: [],
      },
    },
    {
      actions: [
        {
          type: 'play',
          card: 'Spark',
          use: 'B',
          to: {
            row: 4,
            col: 9,
          },
        },
        {
          type: 'play',
          card: 'Fireball',
          use: 'A',
          target: 'O',
        },
      ],
      after: {
        round: 7,
        result: null,
        hp: 7,
        pos: {
          row: 4,
          col: 9,
        },
        doorOpen: true,
        looted: false,
        monsters: {
          G1: {
            pos: {
              row: 2,
              col: 4,
            },
            hp: 0,
            revealed: true,
          },
          G2: {
            pos: {
              row: 4,
              col: 4,
            },
            hp: 0,
            revealed: true,
          },
          G3: {
            pos: {
              row: 2,
              col: 6,
            },
            hp: 0,
            revealed: true,
          },
          O: {
            pos: {
              row: 3,
              col: 8,
            },
            hp: 8,
            revealed: true,
          },
        },
        hand: [],
        draw: [],
        discard: ['Barrier', 'Fireball', 'Force Push', 'Frost Snare', 'Mend', 'Spark', 'Ward'],
        lost: ['Arcane Bolt', 'Arcane Recall', 'Meteor'],
        showing: [],
      },
    },
    {
      actions: [
        {
          type: 'rest',
          lose: 'Barrier',
        },
        {
          type: 'play',
          card: 'Fireball',
          use: 'A',
          target: 'O',
        },
        {
          type: 'discard',
          card: 'Frost Snare',
        },
      ],
      after: {
        round: 8,
        result: null,
        hp: 7,
        pos: {
          row: 4,
          col: 9,
        },
        doorOpen: true,
        looted: false,
        monsters: {
          G1: {
            pos: {
              row: 2,
              col: 4,
            },
            hp: 0,
            revealed: true,
          },
          G2: {
            pos: {
              row: 4,
              col: 4,
            },
            hp: 0,
            revealed: true,
          },
          G3: {
            pos: {
              row: 2,
              col: 6,
            },
            hp: 0,
            revealed: true,
          },
          O: {
            pos: {
              row: 3,
              col: 8,
            },
            hp: 6,
            revealed: true,
          },
        },
        hand: ['Force Push', 'Mend', 'Spark', 'Ward'],
        draw: [],
        discard: ['Fireball', 'Frost Snare'],
        lost: ['Arcane Bolt', 'Arcane Recall', 'Barrier', 'Meteor'],
        showing: [],
      },
    },
    {
      actions: [
        {
          type: 'play',
          card: 'Spark',
          use: 'B',
          to: {
            row: 6,
            col: 10,
          },
        },
        {
          type: 'play',
          card: 'Force Push',
          use: 'move',
          to: {
            row: 6,
            col: 11,
          },
        },
      ],
      after: {
        round: 9,
        result: null,
        hp: 7,
        pos: {
          row: 6,
          col: 11,
        },
        doorOpen: true,
        looted: false,
        monsters: {
          G1: {
            pos: {
              row: 2,
              col: 4,
            },
            hp: 0,
            revealed: true,
          },
          G2: {
            pos: {
              row: 4,
              col: 4,
            },
            hp: 0,
            revealed: true,
          },
          G3: {
            pos: {
              row: 2,
              col: 6,
            },
            hp: 0,
            revealed: true,
          },
          O: {
            pos: {
              row: 3,
              col: 8,
            },
            hp: 6,
            revealed: true,
          },
        },
        hand: ['Mend', 'Ward'],
        draw: [],
        discard: ['Fireball', 'Force Push', 'Frost Snare', 'Spark'],
        lost: ['Arcane Bolt', 'Arcane Recall', 'Barrier', 'Meteor'],
        showing: [],
      },
    },
    {
      actions: [
        {
          type: 'play',
          card: 'Mend',
          use: 'loot',
        },
        {
          type: 'rest',
          lose: 'Frost Snare',
        },
      ],
      after: {
        round: 10,
        result: null,
        hp: 7,
        pos: {
          row: 6,
          col: 11,
        },
        doorOpen: true,
        looted: true,
        monsters: {
          G1: {
            pos: {
              row: 2,
              col: 4,
            },
            hp: 0,
            revealed: true,
          },
          G2: {
            pos: {
              row: 4,
              col: 4,
            },
            hp: 0,
            revealed: true,
          },
          G3: {
            pos: {
              row: 2,
              col: 6,
            },
            hp: 0,
            revealed: true,
          },
          O: {
            pos: {
              row: 5,
              col: 9,
            },
            hp: 6,
            revealed: true,
          },
        },
        hand: ['Fireball', 'Force Push', 'Mend', 'Spark', 'Ward'],
        draw: [],
        discard: [],
        lost: ['Arcane Bolt', 'Arcane Recall', 'Barrier', 'Frost Snare', 'Meteor'],
        showing: [],
      },
    },
    {
      actions: [
        {
          type: 'play',
          card: 'Fireball',
          use: 'A',
          target: 'O',
        },
        {
          type: 'play',
          card: 'Spark',
          use: 'A',
          target: 'O',
        },
      ],
      after: {
        round: 11,
        result: null,
        hp: 7,
        pos: {
          row: 6,
          col: 11,
        },
        doorOpen: true,
        looted: true,
        monsters: {
          G1: {
            pos: {
              row: 2,
              col: 4,
            },
            hp: 0,
            revealed: true,
          },
          G2: {
            pos: {
              row: 4,
              col: 4,
            },
            hp: 0,
            revealed: true,
          },
          G3: {
            pos: {
              row: 2,
              col: 6,
            },
            hp: 0,
            revealed: true,
          },
          O: {
            pos: {
              row: 5,
              col: 9,
            },
            hp: 2,
            revealed: true,
          },
        },
        hand: ['Force Push', 'Mend', 'Ward'],
        draw: [],
        discard: ['Fireball', 'Spark'],
        lost: ['Arcane Bolt', 'Arcane Recall', 'Barrier', 'Frost Snare', 'Meteor'],
        showing: [],
      },
    },
    {
      actions: [
        {
          type: 'play',
          card: 'Mend',
          use: 'B',
          to: {
            row: 6,
            col: 10,
          },
        },
        {
          type: 'play',
          card: 'Force Push',
          use: 'A',
          target: 'O',
          axis: 'row',
        },
      ],
      after: {
        round: 11,
        result: 'victory',
        hp: 7,
        pos: {
          row: 6,
          col: 10,
        },
        doorOpen: true,
        looted: true,
        monsters: {
          G1: {
            pos: {
              row: 2,
              col: 4,
            },
            hp: 0,
            revealed: true,
          },
          G2: {
            pos: {
              row: 4,
              col: 4,
            },
            hp: 0,
            revealed: true,
          },
          G3: {
            pos: {
              row: 2,
              col: 6,
            },
            hp: 0,
            revealed: true,
          },
          O: {
            pos: {
              row: 3,
              col: 9,
            },
            hp: 0,
            revealed: true,
          },
        },
        hand: ['Ward'],
        draw: [],
        discard: ['Fireball', 'Force Push', 'Mend', 'Spark'],
        lost: ['Arcane Bolt', 'Arcane Recall', 'Barrier', 'Frost Snare', 'Meteor'],
        showing: [],
      },
    },
  ],
  result: 'victory',
  roundsPlayed: 11,
}
