// A reference game recorded from the Python simulator used to design Scenario 1 (rules-spec v0.7).
// It lists every play a perfect-foresight search made, the shuffles that happened (scripted, so the
// replay does not depend on any random generator), and the game state after each round.
// Cards and enemy cards are named as printed. Do not edit by hand: regenerate from the simulator.
// (cardsAsRecorded was added by hand when Charge changed; the recorded plays are untouched.)

import type { ReferenceGame } from './referenceGameTypes.ts'

export const warriorReference: ReferenceGame = {
  name: 'warrior-seed-1',
  hero: 'warrior',
  // Recorded before Charge became "Move 3, then Attack 2" with no Burn (rules-spec v0.9).
  cardsAsRecorded: [
    {
      id: 'warrior-charge',
      name: 'Charge',
      halfA: {
        text: 'Move 3, then Attack 3',
        burn: true,
        effects: [
          { kind: 'move', distance: 3 },
          { kind: 'attack', damage: 3, range: 1 },
        ],
      },
      halfB: { text: 'Move 3', burn: false, effects: [{ kind: 'move', distance: 3 }] },
    },
  ],
  deal: [
    'Second Wind',
    'Heavy Blow',
    'Last Stand',
    'Charge',
    'Guard Stance',
    'Shield Bash',
    'Cleave',
    'Hold the Line',
    'Quick Strike',
    'Sweep',
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
  ],
  heroShuffles: [
    [
      'Shield Bash',
      'Sweep',
      'Last Stand',
      'Hold the Line',
      'Quick Strike',
      'Cleave',
      'Second Wind',
    ],
    ['Hold the Line', 'Second Wind', 'Shield Bash', 'Last Stand', 'Sweep', 'Quick Strike'],
    ['Sweep', 'Shield Bash', 'Quick Strike', 'Second Wind', 'Last Stand'],
  ],
  enemyShuffles: [
    [
      'Advance',
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
          card: 'Guard Stance',
          use: 'B',
          to: {
            row: 2,
            col: 2,
          },
        },
        {
          type: 'play',
          card: 'Charge',
          use: 'A',
          to: {
            row: 3,
            col: 4,
          },
          target: 'G2',
        },
      ],
      after: {
        round: 2,
        result: null,
        hp: 10,
        pos: {
          row: 3,
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
        hand: ['Cleave', 'Heavy Blow', 'Last Stand', 'Second Wind', 'Shield Bash'],
        draw: ['Hold the Line', 'Quick Strike', 'Sweep'],
        discard: ['Guard Stance'],
        lost: ['Charge'],
        showing: [],
      },
    },
    {
      actions: [
        {
          type: 'play',
          card: 'Cleave',
          use: 'A',
          target: 'G1',
          second: 'G2',
        },
        {
          type: 'play',
          card: 'Last Stand',
          use: 'B',
          target: 'G1',
        },
      ],
      after: {
        round: 3,
        result: null,
        hp: 10,
        pos: {
          row: 3,
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
        hand: ['Heavy Blow', 'Hold the Line', 'Quick Strike', 'Second Wind', 'Shield Bash'],
        draw: ['Sweep'],
        discard: ['Cleave', 'Guard Stance', 'Last Stand'],
        lost: ['Charge'],
        showing: [],
      },
    },
    {
      actions: [
        {
          type: 'play',
          card: 'Quick Strike',
          use: 'B',
          to: {
            row: 4,
            col: 5,
          },
        },
        {
          type: 'play',
          card: 'Hold the Line',
          use: 'move',
          to: {
            row: 3,
            col: 6,
          },
        },
      ],
      after: {
        round: 4,
        result: null,
        hp: 10,
        pos: {
          row: 3,
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
        hand: ['Heavy Blow', 'Second Wind', 'Shield Bash', 'Sweep'],
        draw: [],
        discard: ['Cleave', 'Guard Stance', 'Hold the Line', 'Last Stand', 'Quick Strike'],
        lost: ['Charge'],
        showing: [],
      },
    },
    {
      actions: [
        {
          type: 'play',
          card: 'Heavy Blow',
          use: 'A',
          target: 'G3',
        },
        {
          type: 'play',
          card: 'Second Wind',
          use: 'B',
          to: {
            row: 3,
            col: 7,
          },
        },
      ],
      after: {
        round: 5,
        result: null,
        hp: 10,
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
              row: 4,
              col: 11,
            },
            hp: 10,
            revealed: true,
          },
        },
        hand: ['Shield Bash', 'Sweep'],
        draw: [],
        discard: [
          'Cleave',
          'Guard Stance',
          'Hold the Line',
          'Last Stand',
          'Quick Strike',
          'Second Wind',
        ],
        lost: ['Charge', 'Heavy Blow'],
        showing: [],
      },
    },
    {
      actions: [
        {
          type: 'rest',
          lose: 'Guard Stance',
        },
        {
          type: 'play',
          card: 'Quick Strike',
          use: 'B',
          to: {
            row: 4,
            col: 9,
          },
        },
        {
          type: 'discard',
          card: 'Hold the Line',
        },
      ],
      after: {
        round: 6,
        result: null,
        hp: 10,
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
              row: 4,
              col: 11,
            },
            hp: 10,
            revealed: true,
          },
        },
        hand: ['Cleave', 'Last Stand', 'Second Wind', 'Shield Bash', 'Sweep'],
        draw: [],
        discard: ['Hold the Line', 'Quick Strike'],
        lost: ['Charge', 'Guard Stance', 'Heavy Blow'],
        showing: [],
      },
    },
    {
      actions: [
        {
          type: 'play',
          card: 'Cleave',
          use: 'B',
          to: {
            row: 6,
            col: 9,
          },
        },
        {
          type: 'play',
          card: 'Last Stand',
          use: 'move',
          to: {
            row: 6,
            col: 10,
          },
        },
        {
          type: 'discard',
          card: 'Second Wind',
        },
      ],
      after: {
        round: 7,
        result: null,
        hp: 10,
        pos: {
          row: 6,
          col: 10,
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
              row: 5,
              col: 10,
            },
            hp: 10,
            revealed: true,
          },
        },
        hand: ['Shield Bash', 'Sweep'],
        draw: [],
        discard: ['Cleave', 'Hold the Line', 'Last Stand', 'Quick Strike', 'Second Wind'],
        lost: ['Charge', 'Guard Stance', 'Heavy Blow'],
        showing: [],
      },
    },
    {
      actions: [
        {
          type: 'play',
          card: 'Shield Bash',
          use: 'A',
          target: 'O',
        },
        {
          type: 'play',
          card: 'Sweep',
          use: 'B',
          to: {
            row: 6,
            col: 11,
          },
        },
      ],
      after: {
        round: 8,
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
              row: 5,
              col: 10,
            },
            hp: 7,
            revealed: true,
          },
        },
        hand: [],
        draw: [],
        discard: [
          'Cleave',
          'Hold the Line',
          'Last Stand',
          'Quick Strike',
          'Second Wind',
          'Shield Bash',
          'Sweep',
        ],
        lost: ['Charge', 'Guard Stance', 'Heavy Blow'],
        showing: [],
      },
    },
    {
      actions: [
        {
          type: 'rest',
          lose: 'Cleave',
        },
        {
          type: 'play',
          card: 'Hold the Line',
          use: 'loot',
        },
        {
          type: 'discard',
          card: 'Last Stand',
        },
      ],
      after: {
        round: 9,
        result: null,
        hp: 10,
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
              col: 10,
            },
            hp: 7,
            revealed: true,
          },
        },
        hand: ['Quick Strike', 'Second Wind', 'Shield Bash', 'Sweep'],
        draw: [],
        discard: ['Hold the Line', 'Last Stand'],
        lost: ['Charge', 'Cleave', 'Guard Stance', 'Heavy Blow'],
        showing: [],
      },
    },
    {
      actions: [
        {
          type: 'play',
          card: 'Quick Strike',
          use: 'B',
          to: {
            row: 6,
            col: 8,
          },
        },
        {
          type: 'play',
          card: 'Second Wind',
          use: 'B',
          to: {
            row: 6,
            col: 10,
          },
        },
        {
          type: 'discard',
          card: 'Sweep',
        },
      ],
      after: {
        round: 10,
        result: null,
        hp: 10,
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
              row: 5,
              col: 10,
            },
            hp: 7,
            revealed: true,
          },
        },
        hand: ['Shield Bash'],
        draw: [],
        discard: ['Hold the Line', 'Last Stand', 'Quick Strike', 'Second Wind', 'Sweep'],
        lost: ['Charge', 'Cleave', 'Guard Stance', 'Heavy Blow'],
        showing: [],
      },
    },
    {
      actions: [
        {
          type: 'play',
          card: 'Shield Bash',
          use: 'A',
          target: 'O',
        },
        {
          type: 'rest',
          lose: 'Hold the Line',
        },
        {
          type: 'discard',
          card: 'Last Stand',
        },
      ],
      after: {
        round: 11,
        result: null,
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
              row: 5,
              col: 10,
            },
            hp: 4,
            revealed: true,
          },
        },
        hand: ['Quick Strike', 'Second Wind', 'Shield Bash', 'Sweep'],
        draw: [],
        discard: ['Last Stand'],
        lost: ['Charge', 'Cleave', 'Guard Stance', 'Heavy Blow', 'Hold the Line'],
        showing: [],
      },
    },
    {
      actions: [
        {
          type: 'play',
          card: 'Shield Bash',
          use: 'A',
          target: 'O',
        },
        {
          type: 'play',
          card: 'Quick Strike',
          use: 'B',
          to: {
            row: 4,
            col: 9,
          },
        },
        {
          type: 'discard',
          card: 'Second Wind',
        },
      ],
      after: {
        round: 12,
        result: null,
        hp: 7,
        pos: {
          row: 4,
          col: 9,
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
              row: 4,
              col: 10,
            },
            hp: 1,
            revealed: true,
          },
        },
        hand: ['Sweep'],
        draw: [],
        discard: ['Last Stand', 'Quick Strike', 'Second Wind', 'Shield Bash'],
        lost: ['Charge', 'Cleave', 'Guard Stance', 'Heavy Blow', 'Hold the Line'],
        showing: [],
      },
    },
    {
      actions: [
        {
          type: 'play',
          card: 'Sweep',
          use: 'A',
          target: 'O',
        },
      ],
      after: {
        round: 12,
        result: 'victory',
        hp: 7,
        pos: {
          row: 4,
          col: 9,
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
              row: 4,
              col: 10,
            },
            hp: 0,
            revealed: true,
          },
        },
        hand: [],
        draw: [],
        discard: ['Last Stand', 'Quick Strike', 'Second Wind', 'Shield Bash', 'Sweep'],
        lost: ['Charge', 'Cleave', 'Guard Stance', 'Heavy Blow', 'Hold the Line'],
        showing: [],
      },
    },
  ],
  result: 'victory',
  roundsPlayed: 12,
}
