# Rules Spec: Solo Tutorial Scenario (MVP)

Status: draft v0.8, 2026-11-11. Source: the design conversations and the playtest simulator. Anything marked **Assumption** was inferred while writing and needs confirmation. Tuning values may still change after more testing.

Changes in v0.8: merged with the repository copy of the spec (which had drifted to an older Shadow Lord version); the engine now implements Scenario 1 and the flip-blind bot, so the bot results are re-measured on the real engine (section 11, item 11); added the blocked-push damage (still undecided in detail), the `doorOpensBy` setting, `packTacticsBonus`, and three new open questions (14 to 16).

Changes in v0.7: Arcane Bolt Half A is now a burn half; Mage reference game replaced (the old one played Arcane Bolt twice); Mage bot win rate re-measured.

Changes in v0.6: Mend heals 2 instead of 3; Mage bot win rate re-measured.

Changes in v0.5: Mage maximum health is now 7; first flip-blind bot results added (section 11, item 11).

Changes in v0.4: Goblin 3 moved from A R3C4 to A R2C6; reference games and balance notes redone.

Changes in v0.3: Mage base shield is now 0; a third goblin was added to Tile A; the rules now say explicitly that monsters take no damage from Mud; reference games and balance notes were redone with these changes.

Changes from v0.1 (made in v0.2): new two-tile map with coordinates; the boss is now an Ogre with Frightening Roar; lava, push, door, chest and potion rules added; monster behavior written down; the scout, the Path A/B endings and Lingering Rot removed; new reference games.

## 1. MVP scope

Included:

- The player picks the Warrior or the Mage and plays Scenario 1, "The Sunken Crypt", alone.
- The full round, rest, burn, shield, and combat rules below.
- The shared enemy deck with a seeded shuffle, so any game can be replayed exactly.
- An end screen showing victory or defeat and the story text.

Not included: XP spending, the gold shop, evolution cards, other scenarios, multiple heroes, saving a campaign.

## 2. Action vocabulary

| Term                         | Meaning                                                                                                                                                                                                                       |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Move N                       | Move up to N movement points, one orthogonal space at a time. Floor costs 1, Mud costs 2. You cannot enter Rubble, Lava, the chest, a space with a monster, or a closed door.                                                 |
| Attack N, Range R            | Deal N damage to one enemy within R spaces (orthogonal distance, counted as rows plus columns). Melee attacks have range 1. There is no line of sight, except that a closed door blocks everything behind it (see section 9). |
| Shield N                     | Place the card face-up as a showing shield worth N. See section 6.                                                                                                                                                            |
| Heal N                       | Restore N health, up to maximum health.                                                                                                                                                                                       |
| Push N                       | Move an enemy N spaces directly away from you. See "Push" in section 6.                                                                                                                                                       |
| Freeze                       | The target cannot move in the next monster phase.                                                                                                                                                                             |
| Loot                         | Spend a play while orthogonally next to the treasure chest to open it.                                                                                                                                                        |
| Interact                     | Open a door or use a map feature next to you. (In Scenario 1 the door opens by stepping on it, so Interact has no use yet.)                                                                                                   |
| Return N cards               | Move N cards of your choice from your discard pile to your hand.                                                                                                                                                              |
| Burn (marked on a card half) | Using that half sends the card to the lost pile for the scenario.                                                                                                                                                             |

Every card can instead be played as Move 2, Attack 1 (melee), Loot, or Interact.

**Adjacent** means orthogonally next to (up, down, left, right). Diagonals are not adjacent.

## 3. Heroes

|                | Warrior  | Mage     |
| -------------- | -------- | -------- |
| Maximum health | 10       | 7        |
| Base shield    | 1        | 0        |
| Deck size      | 10 cards | 10 cards |
| Hand size      | 5        | 5        |

### Warrior deck

| #   | Card          | Half A                                             | Burn A? | Half B   |
| --- | ------------- | -------------------------------------------------- | ------- | -------- |
| 1   | Cleave        | Attack 2, plus 1 damage to a second adjacent enemy | No      | Move 2   |
| 2   | Quick Strike  | Attack 3                                           | No      | Move 3   |
| 3   | Sweep         | Attack 2 to ALL adjacent enemies                   | No      | Move 2   |
| 4   | Shield Bash   | Attack 2, Push 1                                   | No      | Shield 2 |
| 5   | Hold the Line | Shield 2 and Heal 1                                | No      | Attack 2 |
| 6   | Guard Stance  | Shield 1 and Attack 2                              | No      | Move 2   |
| 7   | Second Wind   | Heal 3                                             | No      | Move 2   |
| 8   | Charge        | Move 3, then Attack 3                              | Yes     | Move 3   |
| 9   | Heavy Blow    | Attack 5                                           | Yes     | Move 2   |
| 10  | Last Stand    | Heal 3 and Shield 2                                | Yes     | Attack 2 |

### Mage deck

| #   | Card          | Half A                                                                      | Burn A? | Half B            |
| --- | ------------- | --------------------------------------------------------------------------- | ------- | ----------------- |
| 1   | Spark         | Attack 3, Range 3                                                           | No      | Move 3            |
| 2   | Arcane Bolt   | Attack 5, Range 2                                                           | Yes     | Shield 2          |
| 3   | Fireball      | Attack 3, Range 3, plus 1 damage to each other enemy adjacent to the target | No      | Move 2            |
| 4   | Frost Snare   | Attack 1, Range 3, Freeze the target                                        | No      | Move 2            |
| 5   | Force Push    | Push 2 (enemy within 3), then Attack 1 (same target)                        | No      | Shield 2          |
| 6   | Ward          | Shield 2                                                                    | No      | Attack 2, Range 2 |
| 7   | Mend          | Heal 2                                                                      | No      | Move 2            |
| 8   | Meteor        | Attack 3 to the target and to all enemies adjacent to it, Range 4           | Yes     | Move 2            |
| 9   | Arcane Recall | Return 2 cards from your discard to your hand                               | Yes     | Attack 1, Range 3 |
| 10  | Barrier       | Shield 3                                                                    | Yes     | Move 2            |

In the solo game, wording that targeted "a hero" or "all heroes" applies to you.

## 4. Round structure

1. **First play.** Play one card from your hand and use one half (or rest).
2. **Monster phase.** If at least one monster is active, flip one card from the shared enemy deck and resolve it. If no monster is active, skip the flip entirely (the deck does not advance).
3. **Second play.** Play a second card (or rest).
4. **End of round.** Resolve end-of-round effects (the Ogre's Frightening Roar), then draw up to 5 cards.

Played cards go to your discard pile, except burned cards (lost pile) and shield cards (see section 6). A monster is **active** if it is on the map, revealed and alive. A monster revealed during a round does not act until the next round's monster phase. If your first play kills the last active monster, there is no monster phase that round.

## 5. Resting, burning, exhaustion

- A **rest** replaces one of your two plays. **Assumption:** at most one rest per round (resting in both slots is an open question).
- To rest you need at least 2 cards in your discard pile. Choose one discard card and move it to the lost pile. Shuffle the rest of the discard into your draw pile, then draw up to 5.
- A rest may be taken in either slot. If your hand is empty at the start of a round, you must rest in the first slot.
- **Lost cards** (burned or lost to a rest) stay out for the rest of the scenario and return when the scenario ends. This keeps the campaign resealable.
- If you cannot play a card and cannot rest, you are **exhausted** and out of the scenario.
- A hero is also out at 0 health. In the solo game, being out is defeat.
- If the draw pile has fewer cards than you need, draw what is there. The hand may stay below 5 until you rest.

## 6. Combat and damage

**Damage you take:** (monster attack + enemy card modifier + any monster bonus) minus your shield, never below 0.

**Damage you deal:** your attack minus the target's armor, never below 0. Armor applies to every damage instance, including the extra damage from Cleave, Sweep, Fireball and Meteor. **Assumption.**

**Shields:**

- A shield card is played face-up and stays showing until the next monster phase resolves, then goes to your discard pile (or the lost pile if it was a burn half). A shield played in the second slot therefore covers the next round's monster phase.
- If several shields are showing, only the highest value applies. They never add together.
- Your base shield counts as a showing shield, so it works as a floor, not an addition. Hold the Line (Shield 2) gives the Warrior 2, not 3.
- If no monster phase happens, a showing shield simply stays until the next one.

**Push:**

- The target moves straight away from you, one space at a time. If you and the target share a row or column, the direction is along it.
- If the target is diagonal to you (different row and column), it is pushed along the axis where the distance is larger. If both distances are equal, you choose the axis.
- A push stops early if the next space is off the map, Rubble, the chest, a closed door, or occupied. A target whose push is blocked takes `blockedPushDamage` (1) damage, even if it had already moved some spaces. **Assumption:** that damage ignores armor and Rubble counts as a wall (open question 16).
- A target pushed into Lava takes 2 damage and the push ends there.

**Terrain:**

- **Lava** deals 2 damage that ignores shield and armor, only when something is pushed into it. Neither you nor monsters will voluntarily move into Lava. A monster left standing in Lava takes no further damage. **Assumption:** heroes cannot be pushed (no effect in Scenario 1).
- **Mud** costs 2 movement per space for everyone. Mud never damages monsters. The only Mud damage is the Toxic Fumes card, which hurts you (not monsters) if you stand on Mud.
- **Rubble** blocks movement and pushes.
- The **chest** blocks movement and pushes.

## 7. Enemy deck

The deck is flipped one card per monster phase. **Assumption:** when the deck is empty, shuffle its discard pile to make a new deck. Unleash Doom also reshuffles the discard pile back in when drawn (not yet in the simulator; see section 11).

| Card         | Qty | Who acts                 | Effect                                                                                       |
| ------------ | --- | ------------------------ | -------------------------------------------------------------------------------------------- |
| The Advance  | 4   | All active monsters      | Move +1, then Attack +0                                                                      |
| The Skirmish | 4   | Monsters adjacent to you | Attack +1; other monsters do nothing                                                         |
| Flanked!     | 1   | All active monsters      | Move toward you, then Attack +0                                                              |
| Enrage       | 1   | Melee monsters           | Move +2, then Attack +0                                                                      |
| Frenzy       | 1   | The closest monster      | Attack twice (no move)                                                                       |
| Toxic Fumes  | 1   | None                     | Monsters do not move or attack. If you stand on Mud, take 1 damage that ignores your shield. |
| Unleash Doom | 2   | All active monsters      | Attack +X (no move), where X is the campaign tier (1 in Scenario 1)                          |
| Regroup      | 1   | None                     | Monsters do not move or attack this round                                                    |

Total 15 cards. Volley (no ranged monster), Collapse (no walls or pillars), and Ambush (no spawn portal) are not in the Scenario 1 deck because nothing on this map lets them do anything. They stay in the design for later scenarios. With one hero, Flanked! behaves the same as The Advance without the +1 move.

## 8. Monsters

| Monster     | Move | Attack | Armor | Health | Special                                                                                                                                                                           |
| ----------- | ---- | ------ | ----- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Goblin (x3) | 3    | 2      | 0     | 4      | Pack Tactics: +1 attack if at least one other goblin is also adjacent to you. Does not stack (two other goblins still give +1 total).                                             |
| Ogre        | 2    | 4      | 1     | 10     | Frightening Roar: at the end of each round, if the Ogre is alive, revealed, and within 2 spaces of you, discard 1 card of your choice from your hand (you choose before drawing). |

**Monster behavior:**

- **Moving.** A monster that is not already adjacent to you moves along the cheapest path (Mud costs 2) toward the nearest space adjacent to you, spending up to its move allowance. It stops when the next step would cost more than it has left. If two paths or spaces tie, choose the lowest row, then the lowest column. **Assumption.**
- Monsters cannot enter Rubble, Lava, the chest, a closed door, or a space with you or another monster. The open door space can be used.
- A monster adjacent to you does not move.
- **Attacking.** A monster attacks only if it is adjacent to you after any movement. Damage is its attack, plus the card modifier, plus Pack Tactics, minus your shield.
- **Order.** Active monsters act in order of distance to you (closest first), ties by lowest row then lowest column.
- A frozen monster does not move (it can still attack if adjacent). Freeze ends after the monster phase.

## 9. Scenario 1: The Sunken Crypt

**Map.** Two tiles joined by a door. Coordinates are Row (R) and Column (C), counted within each tile.

Tile A (hallway), rows R2 to R4, columns C1 to C6. There is no row R1 on Tile A.

```
        C1  C2  C3  C4  C5  C6   [Door]
   R2   .   .   .   G   X   G
   R3   H   .   .   .   X   .     D
   R4   .   .   .   G   .   .
```

Tile B (ritual chamber), rows R1 to R6, columns C1 to C5.

```
        C1  C2  C3  C4  C5
   R1   .   .   .   .   .
   R2   .   .   .   .   .
   R3   D>  L   L   .   .
   R4   .   .   L   O   .
   R5   .   .   .   M   M
   R6   .   .   .   M   $
```

Key: H = hero start, M = Mud, X = Rubble, L = Lava, O = Ogre start, $ = treasure chest, D = door space. G = goblin start. On Tile A, the goblins at R2C4 and R4C4 stand on Mud; R2C6 is Floor.

| Item                               | Location                                      |
| ---------------------------------- | --------------------------------------------- |
| Hero start                         | A R3C1                                        |
| Goblin 1                           | A R2C4 (Mud)                                  |
| Goblin 2                           | A R4C4 (Mud)                                  |
| Goblin 3                           | A R2C6 (Floor)                                |
| Rubble                             | A R2C5, A R3C5                                |
| Door                               | The space between A R3C6 and B R3C1, in row 3 |
| Lava                               | B R3C2, B R3C3, B R4C3                        |
| Ogre (hidden until the door opens) | B R4C4                                        |
| Mud around the chest               | B R5C4, B R5C5, B R6C4                        |
| Treasure chest                     | B R6C5                                        |

**Door.** The door space starts closed. It opens when you move onto it; your movement then ends. (This is the setting `doorOpensBy: 'step'`. The setting `'interact'` is the earlier wording: the door cannot be entered while closed, and a play used as Interact from a space next to it opens it. Which one is right is open question 15; the reference games use 'step'.) The Ogre is revealed at that moment but does not act until the next round's monster phase. The open door can be used by anyone. Before the door opens, Tile B cannot be targeted or entered.

**Chest.** Loot from a space orthogonally next to the chest (B R5C5 or B R6C4). The chest holds a healing potion: heal 4 immediately (up to maximum health) and the chest is looted. The chest's reward for a future scenario is recorded as "loot" on the end screen only.

**Story.** Get in and out, defeat every monster, and take the loot.

**Victory.** All monsters are dead and the chest has been looted. The game ends the moment both are true.
**Defeat.** You are out (0 health or exhausted). Defeat still earns XP (amount to be decided) but no loot.

In the MVP the end screen only shows the matching text.

## 10. Configuration values

These live in `src/engine/data/` and must not be hard-coded in logic.

| Key                                | Default                                          |
| ---------------------------------- | ------------------------------------------------ |
| handSize                           | 5                                                |
| playsPerRound                      | 2                                                |
| minDiscardToRest                   | 2                                                |
| warriorHealth / mageHealth         | 10 / 7                                           |
| warriorBaseShield / mageBaseShield | 1 / 0                                            |
| goblinCount                        | 3                                                |
| goblinAttack                       | 2                                                |
| goblinHealth / goblinMove          | 4 / 3                                            |
| ogreHealth                         | 10                                               |
| ogreAttack / ogreMove              | 4 / 2                                            |
| ogreArmor                          | 1                                                |
| roarRange                          | 2                                                |
| lavaDamage                         | 2                                                |
| mudCost                            | 2                                                |
| chestPotionHeal                    | 4                                                |
| toxicFumesDamage                   | 1                                                |
| campaignTier                       | 1                                                |
| maxRestsPerRound                   | 1                                                |
| packTacticsBonus                   | 1                                                |
| blockedPushDamage                  | 1                                                |
| doorOpensBy                        | step                                             |
| chestGold                          | 10 (not used by the engine yet; end screen only) |
| victoryXp                          | 2 (not used by the engine yet; end screen only)  |

## 11. Open questions and tuning status

1. **Goblin strength.** Resolved: goblin Attack is 2.
2. **Mage durability and base shield.** Resolved for now: the Mage has 7 health and base shield 0, with four shield-capable cards. The bot results in item 11 suggest she is still the easier hero.
3. **Base shield as floor.** Resolved: confirmed.
4. **Rest in both slots.** Undecided. Default is one rest per round.
5. **Enemy deck.** Resolved: 15 cards for Scenario 1.
6. **Defeat XP.** Amount to be decided.
7. **Revival.** Not applicable in solo. Undecided for multi-hero.
8. **Flanked! tie-break.** Not needed solo. Needed when there are several heroes.
9. **Enemy deck running out and Unleash Doom reshuffle.** Games with three goblins can last longer than 15 flips in rare cases. The rules say to reshuffle the enemy discard into a new deck (and Unleash Doom does the same). The Python simulator never reshuffled: it replayed the same 15-card order, and it did not reshuffle after Unleash Doom either. **The engine now implements the real rules** (the whole deck, the Unleash Doom card included, is reshuffled after Unleash Doom resolves). This matters more than first thought: with 2 Unleash Doom cards in 15, Doom shows up early and the reshuffle puts a second Doom back in play. See item 11 for the effect on win rates. The reference games in section 12 were recorded without the Doom reshuffle, so the engine's tests script the order of the flips after Doom (see the conventions there).
   9a. **Goblin 3 placement.** Resolved: Goblin 3 starts at A R2C6 (Floor), by the door end of the hallway. It was moved there from A R3C4 so that one Fireball or Meteor cannot hit all three goblins.
10. **Heroes and Lava.** Heroes cannot enter Lava voluntarily. Whether anything can push a hero is undecided.
11. **Balance.** Two kinds of evidence, which disagree in a useful way.
    - **Perfect-foresight search** (the solver knows the flip order and every rest shuffle in advance). Found a winning line for every deal tested: 10 of 10 Warrior deals and 7 of 7 Mage deals at 7 health. This is a ceiling.
    - **Flip-blind bot, 1000 seeded games per hero** (seeds 1001 to 2000, Mage at 7 health, Goblin 3 at A R2C6). The bot sees the board and counts the enemy cards left in the current 15-card pass, but not their order.

      |         | Wins                      | Lost to health | Lost to exhaustion | Avg rounds in a win | Avg damage taken in a win |
      | ------- | ------------------------- | -------------- | ------------------ | ------------------- | ------------------------- |
      | Warrior | 46.4% (plus or minus 3.1) | 13.3%          | 40.3%              | 14.4                | 11.4                      |
      | Mage    | 78.0% (plus or minus 2.6) | 18.0%          | 4.0%               | 16.9                | 7.1                       |

    - **Mend 3 to 2** (Mage at 7 health, same 1000 seeds): the Mage's win rate fell from 78.0% to 73.4% (plus or minus 2.7). Matching seeds: 690 won both times, 90 flipped from win to loss, 44 from loss to win. Losses to health rose from 18.0% to 22.6%. Average damage taken in a win fell slightly (6.6 versus 7.1), so she wins the same way with a little less buffer.
    - **Arcane Bolt as a burn card** (Mage at 7 health, Mend 2, same 1000 seeds): the Mage's win rate fell from 73.4% to 61.6% (plus or minus 3.0). Matching seeds: 603 won both times, 131 flipped from win to loss, only 13 from loss to win. Losses to health rose to 26.3% and losses to exhaustion rose from 4.0% to 12.1%, because burning a card shrinks her deck. Average damage taken in a win is unchanged (6.5), so the cost is mostly card economy, not durability.
    - **Mage health 7 versus 8** (same bot, 500 matching seeds): 82% with 7 health, 86% with 8. Dropping one health point cost about 4 percentage points.
    - **How to read these.** The bot is a decent but imperfect player. It took four rounds of tuning to get the Warrior from about 10% to 46%, mostly by teaching it to line up Lava pushes, so the Warrior number is sensitive to how well the player uses Lava. A strong human would likely land between the bot and the perfect-foresight ceiling. The bot's Mage never needed that tuning, which is itself a sign that she is easier.
    - **The Warrior mostly runs out of cards, not health.** 40% of Warrior games end by exhaustion. A rest comes about every 2.5 rounds and costs a card, so the game has a built-in clock of roughly 17 to 20 rounds. Winning lines need to finish the Ogre by about round 14.
    - **Re-measured on the real engine** (TypeScript bot ported from the Python one; 1000 games per line, seeds 1001 to 2000; the TS random generator is different, so individual games differ from the Python runs). With the real Unleash Doom reshuffle:

      |         | Door opens by | Wins                      | Lost to health | Lost to exhaustion | Avg round of a win |
      | ------- | ------------- | ------------------------- | -------------- | ------------------ | ------------------ |
      | Warrior | step          | 36.5% (plus or minus 3.0) | 15.5%          | 48.0%              | 14.3               |
      | Warrior | interact      | 34.2% (plus or minus 2.9) | 13.6%          | 52.2%              | 14.8               |
      | Mage    | step          | 56.7% (plus or minus 3.1) | 24.9%          | 18.4%              | 17.3               |
      | Mage    | interact      | 54.1% (plus or minus 3.1) | 25.2%          | 20.7%              | 17.8               |

      The port was checked by switching the Doom reshuffle off in a scratch run (600 games): Warrior 45.5% and Mage 58.7%, in line with the Python numbers (46.4% and 61.6%). Blocked-push damage made no measurable difference (Warrior 38.3% with it, 37.8% without). So the whole gap is the Doom reshuffle: a second Unleash Doom (attack +1 for every monster) arrives sooner, and the Warrior, who is already short of cards, pays for it. Interact versus step costs about 2 to 3 points.

    - **Unknown bot limits.** It plans one play at a time, does not plan its rests, and was tuned on seeds 1 to 40, then tested on different seeds. The TypeScript bot counts the enemy cards left in the draw pile (it does not know their order).
    - Lava remains the key lever against the Ogre: two pushes remove 4 of its 10 health, ignoring armor. The Ogre can walk out of the lava on its next move.
12. **Mage balance options.** Tested with the solver on the same deals: Ogre Roar range 3 instead of 2 left the Mage's damage taken unchanged (2.75 versus 2.75 per game over 8 deals) and raised the Warrior's slightly (8.5 versus 7.6). Force Push range 2 plus Meteor range 3 also changed nothing (3.0 versus 2.9 over 9 deals). Range alone is not the lever. Done so far: Mage health 8 to 7 (about 4 points of win rate), Mend 3 to 2 (about 5 points) and Arcane Bolt as a burn card (about 12 points); see item 11. Untested: Ogre health 10 to 12; Ogre move 2 to 3.
13. **Balance method.** The two reference games in section 12 are single lines of play. Win rates come from the bot in item 11; the TypeScript engine reproduces both reference games round by round (`src/engine/fixtures.test.ts`), and the ported bot gives the numbers in item 11.

14. **Force Push when the push moves the target out of attack range.** Force Push is "Push 2 (enemy within 3), then Attack 1 (same target)". Because a push moves the target away, the target is usually out of range for the attack afterward unless it was adjacent. The engine and the simulator treat an attack on a target that is no longer in range as an illegal play. The alternative is that the attack simply does nothing. Undecided.
15. **How the door opens.** Stepping onto the door (this spec, `doorOpensBy: 'step'`) or a play used as Interact from next to it (the earlier repository wording, `'interact'`). Both are implemented behind the setting; the default is 'step' because all balance numbers and reference games were made that way. Undecided.
16. **Blocked pushes.** Does armor reduce the 1 damage? Does Rubble count as a wall for a push? The engine assumes no and yes. Undecided.

## 12. Reference games

Two full games found by the simulator, recorded so the engine can reproduce them exactly. Both use these conventions:

- The deal order lists the 10 cards: the first 5 are the starting hand, the other 5 are the draw pile top-to-bottom.
- Enemy flips are taken in the order listed, one per monster phase that actually happens.
- When the draw pile runs out and a rest happens, the shuffle result is given explicitly (the simulator's shuffle cannot be reproduced in TypeScript).
- The enemy deck order is given for the first 15 flips. After the first Unleash Doom the engine reshuffles the whole deck (section 7), but the games were recorded without that reshuffle, so the tests script the order of the remaining flips (`enemyShuffles` in `src/engine/fixtures/`). The flips shown in the tables below are the ones actually used.
- Coordinates: "A R3C4" means Tile A row 3 column 4; "Door" is the door space.
- "Played as Move 2" means a card's generic action, not its printed half.

### Warrior (victory in round 12, health 7/10)

Deal order: Second Wind, Heavy Blow, Last Stand, Charge, Guard Stance | Shield Bash, Cleave, Hold the Line, Quick Strike, Sweep.
Flip order: Frenzy, Toxic Fumes, Skirmish, Regroup, Advance, Advance, Skirmish, Unleash Doom, Advance, Skirmish.
Rest in round 5 (loses Guard Stance): new hand Shield Bash, Sweep, Last Stand, Hold the Line, Quick Strike; draw pile top-to-bottom Cleave, Second Wind.
Rest in round 8 (loses Cleave): new hand Hold the Line, Second Wind, Shield Bash, Last Stand, Sweep; draw pile Quick Strike.
Rest in round 10 (loses Hold the Line): new hand Sweep, Shield Bash, Quick Strike, Second Wind, Last Stand; draw pile empty.

| Rd  | Flip         | Plays                                                                              | Result                                                                                                                                            |
| --- | ------------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Frenzy       | Guard Stance B (Move 2) to A R2C2; Charge A (burn): Move to A R3C4, Attack 3 on G2 | Flip: nobody adjacent. G2 4 to 1.                                                                                                                 |
| 2   | Toxic Fumes  | Cleave A on G1, second target G2; Last Stand B (Attack 2) on G1                    | G1 4 to 2, G2 dead. Toxic Fumes: hero on Floor, nothing. G1 dead.                                                                                 |
| 3   | Skirmish     | Quick Strike B (Move 3) to A R4C5; Hold the Line played as Move 2 to A R3C6        | Flip: G3 is not adjacent. Health 10.                                                                                                              |
| 4   | none         | Heavy Blow A (burn) on G3; Second Wind B (Move 2) to Door                          | G3 dead. No active monsters, so no flip. Door opens, Ogre revealed.                                                                               |
| 5   | Regroup      | Rest (lose Guard Stance); Quick Strike B (Move 3) to B R4C2                        | Regroup: nothing happens. Roar: Ogre within 2, discard Hold the Line, refill.                                                                     |
| 6   | Advance      | Cleave B (Move 2) to B R6C2; Last Stand played as Move 2 to B R6C3                 | Flip: Ogre moves 3 to B R5C3. Roar: discard Second Wind.                                                                                          |
| 7   | Advance      | Shield Bash A; Sweep B (Move 2) to B R6C4                                          | Bash: 1 damage (Ogre 9), pushed north into Lava at B R4C3: 2 more (7). Flip: Ogre walks out to B R5C3 and hits for 4-1 = 3: health 7. Hand empty. |
| 8   | Skirmish     | Rest (hand empty; lose Cleave); Hold the Line played as Loot                       | Flip: Ogre is diagonal, not adjacent. Potion heals 4: health 10 (capped). Roar: discard Last Stand.                                               |
| 9   | Unleash Doom | Quick Strike B (Move 3) to B R6C1; Second Wind B (Move 2) to B R6C3                | Flip: nobody adjacent. Roar: discard Sweep.                                                                                                       |
| 10  | Advance      | Shield Bash A; Rest (hand empty; lose Hold the Line)                               | Ogre 7 to 6, Lava push: 4. Flip: Ogre returns to B R5C3 and hits for 3: health 7. Roar: discard Last Stand.                                       |
| 11  | Skirmish     | Shield Bash A; Quick Strike B (Move 3) to B R4C2                                   | Ogre 4 to 3, Lava push: 1. Flip: not adjacent. Roar: discard Second Wind.                                                                         |
| 12  | none         | Sweep A                                                                            | Ogre (1 health, armor 1) takes 1: dead. All monsters dead and chest looted: victory.                                                              |

### Mage (victory in round 11, health 7/7, no damage taken)

Deal order: Mend, Arcane Recall, Barrier, Meteor, Ward | Frost Snare, Spark, Force Push, Arcane Bolt, Fireball.
Flip order: Frenzy, Toxic Fumes, Skirmish, Regroup, Advance, Advance, Skirmish, Unleash Doom, Advance, Skirmish, Skirmish.
Rest in round 7 (loses Barrier): new hand Frost Snare, Ward, Fireball, Mend, Spark; draw pile Force Push.
Rest in round 9 (loses Frost Snare): new hand Ward, Fireball, Force Push, Mend, Spark; draw pile empty.

| Rd  | Flip         | Plays                                                                               | Result                                                                                                                                                                                                                                              |
| --- | ------------ | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Frenzy       | Meteor A (burn) on G2 (range 4); Barrier B (Move 2) to A R3C3                       | G2 4 to 1. Flip: closest goblin is not adjacent, nothing.                                                                                                                                                                                           |
| 2   | Toxic Fumes  | Frost Snare A on G2; Spark B (Move 3) to A R4C4 (Mud)                               | G2 dead. Toxic Fumes: the hero was on Floor at the flip, nothing.                                                                                                                                                                                   |
| 3   | Skirmish     | Arcane Bolt A (burn) on G1 (range 2); Force Push played as Move 2 to A R4C6         | G1 takes 5, dead. Flip: G3 not adjacent.                                                                                                                                                                                                            |
| 4   | Regroup      | Mend B (Move 2) to Door; Fireball A on G3                                           | Door opens, Ogre revealed. Regroup: nothing. G3 4 to 1.                                                                                                                                                                                             |
| 5   | Advance      | Ward B (Attack 2, range 2) on G3; Arcane Recall A (burn), return Fireball and Spark | G3 dead. Flip: Ogre moves 3 to B R2C3.                                                                                                                                                                                                              |
| 6   | Advance      | Spark B (Move 3) to B R4C2; Fireball A on Ogre                                      | Flip: Ogre moves 3 to B R3C1, not adjacent. Fireball deals 2: Ogre 10 to 8. Hand empty, so no Roar discard.                                                                                                                                         |
| 7   | Skirmish     | Rest (hand empty; lose Barrier); Fireball A                                         | Flip: not adjacent. Ogre 8 to 6. Roar: discard Frost Snare, refill from Force Push.                                                                                                                                                                 |
| 8   | Unleash Doom | Spark B (Move 3) to B R6C3; Force Push played as Move 2 to B R6C4 (Mud)             | Flip: nobody adjacent.                                                                                                                                                                                                                              |
| 9   | Advance      | Mend played as Loot; Rest (lose Frost Snare)                                        | Potion heals 4 (health already full). Flip: Ogre moves 3 to B R5C2. Hand refilled to 5.                                                                                                                                                             |
| 10  | Skirmish     | Fireball A; Spark A                                                                 | Flip: Ogre not adjacent. Fireball 2, Spark 2: Ogre 6 to 2.                                                                                                                                                                                          |
| 11  | Skirmish     | Mend B (Move 2) to B R6C3; Force Push A                                             | Flip: Ogre is diagonal, not adjacent. Force Push: the hero and Ogre differ by one row and one column, so the hero chooses the axis. Pushing north 2 puts the Ogre into Lava at B R3C2: 2 damage, dead. All monsters dead and chest looted: victory. |

Findings:

- **Both heroes can win.** The Warrior's game used three Lava pushes, because the Ogre walks out of the Lava and can be pushed back in.
- **Moving Goblin 3 away from the others stops the one-card goblin wipe.** The Mage needed four plays to clear the goblins in this game, versus two before.
- **The Mage still took no damage in the perfect-foresight line**, but with Arcane Bolt burning she needed 11 rounds and two rests, and she finished the Ogre with a Lava push. See open question 12.
- **One line of play is not a win rate.** These games show that the rules work, not how often a real player wins.
