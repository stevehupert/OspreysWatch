// Playing cards by clicking. Seed 1 deals the Warrior Charge, Heavy Blow, Shield Bash, Sweep and
// Quick Strike, with the hero at A R3C1 (row 3, column 1) and goblins at A R2C4, A R4C4 and A R2C6.

import { expect, test, type Page } from '@playwright/test'

const card = (page: Page, name: string) =>
  page.getByLabel('Hand').getByRole('button', { name: new RegExp(`^${name}`) })
const controls = (page: Page) => page.getByLabel('Controls')
const pile = (page: Page) => page.getByLabel('Piles')

test.beforeEach(async ({ page }) => {
  await page.goto('/?hero=warrior&seed=1')
  await expect(controls(page)).toContainText('Round 1, play 1 of 2')
})

test('plays a full round: Charge onto the map, then a shield', async ({ page }) => {
  await card(page, 'Charge').click()
  await controls(page).getByRole('button', { name: 'A: Move 3, then Attack 2' }).click()
  await page.getByRole('button', { name: 'Move to row 3, column 4' }).click()

  // From A R3C4 both G1 and G2 are next to the hero. Hitting G2 finishes the play.
  await expect(page.getByRole('button', { name: 'Target G1' })).toBeVisible()
  await page.getByRole('button', { name: 'Target G2' }).click()

  // The monster phase has run: an enemy card was flipped, and Charge is in the discard pile.
  await expect(controls(page)).toContainText('Round 1, play 2 of 2')
  await expect(page.getByLabel('Status')).not.toContainText('None yet')
  await expect(pile(page)).toContainText('Charge')

  // Shield 2 has nothing to choose, so one click plays it and ends the round.
  await card(page, 'Shield Bash').click()
  await controls(page).getByRole('button', { name: 'B: Shield 2' }).click()
  await expect(controls(page)).toContainText('Round 2, play 1 of 2')
  await expect(page.getByLabel('Hand').getByRole('button')).toHaveCount(5)
})

test('asks before a play that wastes something; Cancel leaves the game as it was', async ({
  page,
}) => {
  await card(page, 'Heavy Blow').click()
  await controls(page).getByRole('button', { name: 'A: Attack 5 (Burn)' }).click()

  // No enemy is in reach, so the only Attack 5 is at nothing. It still burns the card.
  await expect(controls(page)).toContainText('are you sure?')
  await expect(controls(page)).toContainText('No enemy is hurt or moved.')
  await expect(controls(page)).toContainText('Heavy Blow burns')

  await controls(page).getByRole('button', { name: 'Cancel' }).click()
  await expect(controls(page)).toContainText('Round 1, play 1 of 2')
  await expect(card(page, 'Heavy Blow')).toBeVisible()

  await card(page, 'Heavy Blow').click()
  await controls(page).getByRole('button', { name: 'A: Attack 5 (Burn)' }).click()
  await controls(page).getByRole('button', { name: 'Play anyway' }).click()
  await expect(controls(page)).toContainText('Round 1, play 2 of 2')
  await expect(pile(page).locator('.pile', { hasText: 'Lost' })).toContainText('Heavy Blow')
})

test('clicking the selected card again puts it back down', async ({ page }) => {
  await card(page, 'Sweep').click()
  await expect(controls(page)).toContainText('How do you want to use this card?')
  await card(page, 'Sweep').click()
  await expect(controls(page)).toContainText('Round 1, play 1 of 2')
})

test("marks Charge's chosen space while you pick its target", async ({ page }) => {
  await card(page, 'Charge').click()
  await controls(page).getByRole('button', { name: 'A: Move 3, then Attack 2' }).click()
  await page.getByRole('button', { name: 'Move to row 3, column 4' }).click()
  await expect(page.getByLabel('You move here')).toBeVisible()
})

test('the log explains your play and the monster phase that follows', async ({ page }) => {
  await card(page, 'Charge').click()
  await controls(page).getByRole('button', { name: 'A: Move 3, then Attack 2' }).click()
  await page.getByRole('button', { name: 'Move to row 3, column 4' }).click()
  await page.getByRole('button', { name: 'Target G2' }).click()

  const log = page.getByLabel('Game log')
  await expect(log.getByText('Round 1')).toBeVisible()
  await expect(log).toContainText('You play Charge, half A: Move 3, then Attack 2.')
  await expect(log).toContainText('You move from row 3, column 1 to row 3, column 4.')
  await expect(log).toContainText('You hit Goblin G2: 2 − 0 (armor) = 2 damage. Health 4 → 2.')
  await expect(log).toContainText('Enemy card:')

  // The status bar names the same enemy card as the log.
  const flipped = await log.locator('li', { hasText: 'Enemy card:' }).first().textContent()
  const name = flipped?.match(/^Enemy card: (.+?)[.!] /)?.[1] ?? ''
  await expect(page.getByLabel('Status')).toContainText(name)
})

test('a rest shows the discarded cards whole; clicking one loses it', async ({ page }) => {
  // Play cards (first option, first highlighted space or monster) until a rest is allowed.
  const rest = controls(page).getByRole('button', { name: 'Rest' })
  for (let step = 0; step < 60 && !(await rest.isVisible()); step++) {
    const onMap = page.locator('.board button.selectable')
    const choices = controls(page).locator('.options button:not(.cancel)')
    if ((await onMap.count()) > 0) await onMap.first().click()
    else if ((await choices.count()) > 0) await choices.first().click()
    else await page.getByLabel('Hand').getByRole('button').first().click()
  }
  await rest.click()

  const losable = controls(page).getByRole('group', { name: 'Cards you can lose' })
  const cards = losable.getByRole('button')
  expect(await cards.count()).toBeGreaterThanOrEqual(2)
  // Each card shows both halves, not just its name.
  await expect(cards.first().locator('.half-label')).toHaveText(['A', 'B'])
  const name = (await cards.first().locator('h3').textContent())!

  await cards.first().click()
  await expect(pile(page).locator('.pile', { hasText: 'Lost' })).toContainText(name)
})
