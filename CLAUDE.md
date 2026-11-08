# Project: Solo Tutorial Dungeon Crawler (MVP)

A browser-based, single-player version of a light, card-driven tactical dungeon crawler board game.
The player picks the Warrior or the Mage and plays Scenario 1 ("The Sunken Crypt") as a solo scenario.
This is a learning project: the owner reviews every change, so keep changes small and explain them plainly.

## Source of truth

- Game rules live in `docs/rules-spec.md`. If code and spec disagree, stop and ask; do not guess.
- If a rule is unclear or undecided (for example hero revival or the Flanked tie-break), do not invent behavior.
  Implement it as a clearly named configuration value, or add the question to `docs/rules-spec.md` under "Open questions".
- Card, monster, enemy-deck, and scenario numbers live in `src/engine/data/`. Never hard-code them in logic.

## Architecture rules

- `src/engine/` is plain TypeScript. It must not import React, the DOM, or anything from `src/ui/`.
- `src/ui/` is React. It displays engine state and sends player actions to the engine. It contains no game rules.
- The engine is deterministic. All randomness goes through a seedable random generator passed in as a parameter,
  so any game can be replayed exactly.
- Keep the stack minimal: TypeScript, React, Vite, Vitest, Playwright, oxlint, Prettier. Ask before adding any dependency.
  (oxlint replaced ESLint because typescript-eslint does not yet support TypeScript 7.)

## Commands

- `npm run dev` starts the dev server.
- `npm test` runs Vitest unit tests and fixture replays (`npm run test:watch` re-runs on save).
- `npm run lint` runs oxlint.
- `npm run format` formats all files with Prettier; `npm run format:check` only checks.
- `npm run build` type-checks and makes the production build.
- `npx playwright test` runs the browser tests (Playwright is not installed yet).

Run tests and lint before every commit. Do not commit with failing checks.

## Working agreements

- Never commit directly to `main`. Create a branch per task, for example `feature/warrior-deck`.
- Write the test for a rule before or together with the code for that rule.
- One logical change per commit, with a clear message. Keep pull requests small enough to review in one sitting.
- Ask before deleting files, changing configuration, or touching anything outside the task.
- The repository is public. Never add secrets, tokens, or personal files.
- When you finish a task, summarize what changed, what you tested, and anything you are unsure about.

## Game essentials (details in docs/rules-spec.md)

- Each hero has a 10-card deck and holds up to 5 cards. Each card has two action halves; a play uses one half.
- A round is: play one card, flip one shared enemy card and resolve it, play a second card, then draw back up to 5.
- A rest can replace either play. It needs at least 2 cards in the discard pile, reshuffles and redraws up to 5,
  and loses one card for the scenario.
- Burn halves send the card to the lost pile for the scenario.
- Shield cards do not stack: your shield is your base shield plus the highest showing shield card.
  Damage taken is attack minus shield, never below zero.
- The party loses when every hero is out; heroes always gain XP but lose loot if the scenario is not completed.
