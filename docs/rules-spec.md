# Rules Spec: Solo Tutorial Scenario (MVP)

Status: draft v0.1, 2026-11-06. Source: the design workbook and the design conversations. Anything marked **Assumption** was inferred while writing and needs confirmation. Tuning values may still change after more testing.

## 1. MVP scope

Included:

- The player picks the Warrior or the Mage and plays Scenario 1, "The Sunken Crypt", alone.
- The full round, rest, burn, shield, and combat rules below.
- The shared enemy deck with a seeded shuffle, so any game can be replayed exactly.
- An end screen showing victory or defeat and the ending text.

Not included: XP spending, the gold shop, evolution cards, other scenarios, multiple heroes, saving a campaign.

## 2. Action vocabulary

| Term                         | Meaning                                                                                 |
| ---------------------------- | --------------------------------------------------------------------------------------- |
| Move N                       | Move up to N spaces. Mud costs 2 per space. Rubble and walls block movement.            |
| Attack N, Range R            | Deal N damage to one enemy within R spaces. Melee attacks have range 1.                 |
| Shield N                     | Place the card face-up as a showing shield worth N. See section 6.                      |
| Heal N                       | Restore N health, up to maximum health (**Assumption**: healing cannot exceed maximum). |
| Push N                       | Move an enemy N spaces directly away from you.                                          |
| Freeze                       | The target cannot move during the next monster phase.                                   |
| Pierce                       | Not used. Dropped from the design.                                                      |
| Loot                         | Spend a play next to the treasure chest to take it. Worth 10 gold.                      |
| Interact                     | Open a door or use a map feature next to you.                                           |
| Return N cards               | Move N cards of your choice from your discard pile to your hand.                        |
| Burn (marked on a card half) | Using that half sends the card to the lost pile for the scenario.                       |

Every card can instead be played as Move 2, Attack 1 (melee), Loot, or Interact.

## 3. Heroes

|                | Warrior  | Mage                                         |
| -------------- | -------- | -------------------------------------------- |
| Maximum health | 10       | 8                                            |
| Base shield    | 1        | 1 (the owner would prefer 0; see section 11) |
| Deck size      | 10 cards | 10 cards                                     |
| Hand size      | 5        | 5                                            |

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
| 2   | Arcane Bolt   | Attack 5, Range 2                                                           | No      | Shield 2          |
| 3   | Fireball      | Attack 3, Range 3, plus 1 damage to each other enemy adjacent to the target | No      | Move 2            |
| 4   | Frost Snare   | Attack 1, Range 3, Freeze the target                                        | No      | Move 2            |
| 5   | Force Push    | Push 2 (enemy within 3), then Attack 1                                      | No      | Shield 2          |
| 6   | Ward          | Shield 2                                                                    | No      | Attack 2, Range 2 |
| 7   | Mend          | Heal 3                                                                      | No      | Move 2            |
| 8   | Meteor        | Attack 3 to the target and all enemies adjacent to it, Range 4              | Yes     | Move 2            |
| 9   | Arcane Recall | Return 2 cards from your discard to your hand                               | Yes     | Attack 1, Range 3 |
| 10  | Barrier       | Shield 3                                                                    | Yes     | Move 2            |

In the solo game, wording that targeted "a hero" or "all heroes" applies to you.

## 4. Round structure

1. **First play.** Play one card from your hand and use one half.
2. **Monster phase.** Flip one card from the shared enemy deck and resolve it for every active monster.
3. **Second play.** Play a second card, or rest.
4. **End of round.** Resolve end-of-round effects (the boss's Aura), then draw up to 5 cards.

Played cards go to your discard pile, except burned cards (lost pile) and shield cards (see section 6). A round in which no monsters are active has no monster phase. Monsters revealed during a round do not act until the next monster phase.

## 5. Resting, burning, exhaustion

- A **rest** replaces one of your two plays. **Assumption:** at most one rest per round (resting in both slots is an open question).
- To rest you need at least 2 cards in your discard pile. Choose one discard card and move it to the lost pile. Shuffle the rest of the discard into your draw pile, then draw up to 5.
- A rest may be taken in either slot. If your hand is empty at the start of a round, you must rest in the first slot.
- **Lost cards** (burned or lost to a rest) stay out for the rest of the scenario and return when the scenario ends. This keeps the campaign resealable.
- If you cannot play a card and cannot rest, you are **exhausted** and out of the scenario.
- A hero is also out at 0 health. In the solo game, being out is defeat.

## 6. Combat and damage

**Damage you take:** (monster attack + enemy card modifier + any monster bonus) minus your shield, never below 0.

**Damage you deal:** your attack minus the target's armor, never below 0. **Assumption:** armor applies to every damage instance, including the extra damage from Cleave and Fireball.

**Shields:**

- A shield card is played face-up and stays showing until the next monster phase resolves, then goes to your discard pile. A shield played in the second slot therefore covers the next round's monster phase.
- If several shields are showing, only the highest value applies. They never add together.
- Your base shield counts as a showing shield, so it works as a floor, not an addition (confirmed). Hold the Line (Shield 2) gives the Warrior 2, not 3.

**Terrain:**

- Lava deals 2 damage to anyone pushed or moving into it, ignoring shield and armor.
- Mud costs 2 movement per space. Rubble blocks movement.

## 7. Enemy deck

The deck is flipped one card per monster phase. **Assumption:** when the deck is empty, shuffle its discard pile to make a new deck. Unleash Doom also reshuffles the discard pile back in when drawn.

| Card         | Qty | Who acts                 | Effect                                                    |
| ------------ | --- | ------------------------ | --------------------------------------------------------- |
| The Advance  | 4   | All monsters             | Move +1, Attack +0                                        |
| The Skirmish | 4   | Monsters adjacent to you | Attack +1; other monsters do nothing                      |
| Flanked!     | 1   | All monsters             | Move toward you, Attack +0                                |
| Enrage       | 1   | Melee monsters           | Move +2, Attack +0                                        |
| Frenzy       | 1   | The closest monster      | Attack twice                                              |
| Toxic Fumes  | 1   | None                     | Monsters do not move. If you stand on Mud, take 1 damage. |
| Unleash Doom | 2   | All monsters             | Attack +X, where X is the campaign tier (1 in Scenario 1) |
| Regroup      | 1   | None                     | Monsters do not move or attack this round                 |

Total 15 cards: the 18 drafted, minus three, plus Regroup as a quiet flip. Volley (no ranged monster), Collapse (no walls or pillars on the map), and Ambush (no spawn portal) were removed from the Scenario 1 deck because nothing on this map lets them do anything. They stay in the design for later scenarios.

## 8. Monsters

| Monster            | Move | Attack | Armor | Health    | Special                                                                                                       |
| ------------------ | ---- | ------ | ----- | --------- | ------------------------------------------------------------------------------------------------------------- |
| Goblin             | 3    | 2      | 0     | 4         | Pack Tactics: +1 attack if another goblin is adjacent to the target. Does not stack.                          |
| Shadow Lord (boss) | 2    | 4      | 1     | 10 (solo) | Rotting Aura: at end of each round, if you are within 2 spaces, discard 1 card of your choice from your hand. |

The boss's Environmental Rage (heals when a hero stands on hazard terrain) is not used in the MVP.

## 9. Scenario 1: The Sunken Crypt

**Map.** Two tiles joined by a door. Tile A is a 3x6 hallway with Mud spaces in the middle and two Rubble spaces. Tile B is a 6x6 ritual chamber with a 2x2 lava pit, a treasure chest beyond the pit, and the boss at the far right. Exact coordinates are to be fixed from the design workbook's diagram.

**Setup.** You start at the left edge of Tile A. Two goblins start on the Mud, about 3 to 4 spaces away.

**Door.** When you step on the door space, stop moving and reveal the boss on Tile B. The boss acts from the next monster phase.

**Victory.** Defeat the boss.
**Defeat.** You are out (0 health or exhausted).

**Ending (victory).**

- Path A, the hero's rescue: the boss is dead and the chest was not looted. You gain 2 XP and unlock Branch A.
- Path B, the mercenary's price: you looted the chest. You gain 2 XP and 10 gold, and the "Lingering Rot" enemy card is added to the deck for later scenarios.

In the MVP the end screen only shows the matching text. **Defeat:** XP is still gained (amount to be decided), with no gold.

## 10. Configuration values

These live in `src/engine/data/` and must not be hard-coded in logic.

| Key                                | Default |
| ---------------------------------- | ------- |
| handSize                           | 5       |
| playsPerRound                      | 2       |
| minDiscardToRest                   | 2       |
| warriorHealth / mageHealth         | 10 / 8  |
| warriorBaseShield / mageBaseShield | 1 / 1   |
| goblinCount                        | 2       |
| goblinAttack                       | 2       |
| bossHealth                         | 10      |
| bossArmor                          | 1       |
| auraRange                          | 2       |
| campaignTier                       | 1       |
| maxRestsPerRound                   | 1       |

## 11. Open questions and tuning status

1. **Goblin strength.** Resolved: goblin Attack is 2.
2. **Mage durability.** 8 health and no base shield. Arcane Bolt and Force Push now have Shield 2 on half B, which, with Ward and Barrier, gives the Mage four shield-capable cards and cuts the chance of a 5-card hand with no shield option from about 22% to about 2%. The Mage's base shield is set to 1, but the owner would prefer her to be vulnerable and may want to return to 0 once the extra shield cards are tested.
3. **Base shield as floor.** Resolved: confirmed.
4. **Rest in both slots.** Undecided. Default is one rest per round.
5. **Enemy deck for Scenario 1.** Resolved: Volley, Collapse, and Ambush removed, Regroup was added as a quiet flip, giving 15 cards. A second Advance was considered and rejected. Flanked is nearly the same as Advance when solo.
6. **Deck size.** Resolved: the Scenario 1 deck is 15 cards.
7. **Defeat XP.** Amount to be decided.
8. **Map coordinates.** Tile layouts and start distances need to be fixed.
9. **Aura and boss pursuit.** Kept as is. The boss moves 2 (3 with Advance) and chases you, so a solo Mage cannot simply stay out of Aura range. Her tools are Frost Snare (Freeze) and Force Push, which the reference game did not use. Untested.
10. **Balance method.** Hand-scripted games are one line of play. Real win rates need the engine plus a simple bot playing thousands of seeded games.

## 12. Reference games

Two scripted solo games using the values in this spec (goblin Attack 2, Mage base shield 1, the current Mage deck). Play was chosen by hand and the enemy flips were fixed in advance, so each game is one line of play, not a sample. The Regroup card was not flipped. Use them as acceptance tests: with the same seed and plays, the engine should reproduce every number.

### Warrior (defeat in round 8, boss at 2 health)

| Rd  | Flip              | Plays                                | Result                                                                                                                                        |
| --- | ----------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Advance           | Shield Bash B (Shield 2); Cleave A   | Each goblin hits for 2+1-2=1: health 10 to 8. Goblin A 4 to 2, goblin B 4 to 3.                                                               |
| 2   | Skirmish          | Sweep A; Quick Strike A              | Sweep kills A and leaves B at 1 before the flip. B hits for 2+1-1=2: health 8 to 6. Quick Strike kills B.                                     |
| 3   | none              | Guard Stance B (move); Second Wind A | Boss revealed. Health 6 to 9. The refill leaves the draw pile empty.                                                                          |
| 4   | Advance           | Hold the Line A; Heavy Blow A (burn) | Shield 2, heal 1 (9 to 10). Boss hits for 4-2=2: health 8. Heavy Blow deals 4: boss 10 to 6. Aura: discard Charge.                            |
| 5   | Skirmish          | Last Stand A (burn); rest            | Heal 3 (8 to 10, one point wasted at the cap), shield 2. Boss hits for 5-2=3: health 7. Rest loses Cleave and redraws 5. Aura: discard Sweep. |
| 6   | Frenzy            | Hold the Line A; Quick Strike A      | Heal 1 (7 to 8), shield 2. Two boss hits of 2: health 4. Quick Strike deals 2: boss 4. Aura: discard Guard Stance.                            |
| 7   | Unleash Doom (+1) | Second Wind A; Charge A (burn)       | Heal 3 (4 to 7), base shield 1. Boss hits for 5-1=4: health 3. Charge deals 2: boss 2. Aura: discard Shield Bash, hand empty.                 |
| 8   | Advance           | Rest (hand empty)                    | Only the base shield of 1 is showing. Boss hits for 4-1=3: health 0, defeated, boss at 2 health.                                              |

### Mage (defeat in round 6, boss at 4 health)

| Rd  | Flip     | Plays                                                         | Result                                                                                                          |
| --- | -------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 1   | Advance  | Ward A (Shield 2); Fireball A                                 | Each goblin hits for 2+1-2=1: health 8 to 6. Fireball: goblin A 4 to 1, goblin B 4 to 3.                        |
| 2   | Skirmish | Arcane Bolt A (kills B); Spark A (kills A)                    | Goblin A hits for 2+1-1=2 before it dies: health 6 to 4.                                                        |
| 3   | none     | Mend A; Frost Snare B (move)                                  | Boss revealed. Health 4 to 7.                                                                                   |
| 4   | Advance  | Arcane Recall A (burn, returns Bolt and Spark); Arcane Bolt A | Only the base shield of 1. Boss hits for 4-1=3: health 4. Bolt deals 4: boss 10 to 6. Aura: discard Force Push. |
| 5   | Skirmish | Barrier A (burn); Spark A                                     | Shield 3. Boss hits for 5-3=2: health 2. Spark deals 2: boss 4. Aura: discard Meteor, hand empty.               |
| 6   | Frenzy   | Rest (hand empty)                                             | Base shield 1. Two boss hits of 3: health 0, defeated, boss at 4 health.                                        |

Findings:

- **Goblin Attack 2 helped.** The Warrior reaches the boss at 6 health instead of 3, and the Mage now survives the goblins instead of dying in round 2.
- **The Warrior lost by one point.** He died at exactly 0 health in round 8 with the boss at 2. Two points of healing were wasted at the health cap in rounds 4 and 5, so different sequencing might change the result.
- **The Mage cannot easily hang back.** The boss moves 2 (3 with Advance) and chases her, so the Aura reached her in rounds 4 and 5. Frost Snare and Force Push could stop that, but this line did not use them, and map positions are not yet defined.
- **One line of play is not a win rate.** These games show where the pressure is, not how often each hero wins.
