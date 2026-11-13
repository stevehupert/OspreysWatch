// The start screen, and the end panel after a game played to the finish through the UI.

import { expect, test, type Page } from '@playwright/test'

const hand = (page: Page) => page.getByLabel('Hand')
const handNames = (page: Page) => hand(page).locator('h3').allTextContents()

test('starts the chosen hero with the chosen seed, and puts them in the address', async ({
  page,
}) => {
  await page.goto('/?hero=mage&seed=7')
  const mageSeed7 = await handNames(page)

  await page.goto('/')
  await expect(page.getByText('Choose your hero')).toBeVisible()
  await page.getByLabel('Mage').check()
  await page.getByLabel('Seed').fill('7')
  await page.getByRole('button', { name: 'Start game' }).click()

  await expect(page).toHaveURL(/\?hero=mage&seed=7$/)
  await expect(page.getByLabel('Status')).toContainText('Mage')
  await expect(page.getByLabel('Status')).toContainText('Seed7')
  expect(await handNames(page)).toEqual(mageSeed7)
})

test('will not start with a seed that is not a whole number', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Seed').fill('1.5')
  await expect(page.getByText('The seed must be a whole number.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Start game' })).toBeDisabled()
})

// Plays without thinking until the game ends: rest whenever allowed, otherwise the first card and
// its first option, the first highlighted space or monster, and "Play anyway" when asked.
async function playToTheEnd(page: Page) {
  const gameOver = page.getByLabel('Game over')
  const controls = page.getByLabel('Controls')
  for (let step = 0; step < 600; step++) {
    if (await gameOver.isVisible()) return
    const onMap = page.locator('.board button.selectable')
    if ((await onMap.count()) > 0) {
      await onMap.first().click()
      continue
    }
    const choices = controls.locator('.options button:not(.cancel)')
    if ((await choices.count()) > 0) {
      await choices.first().click()
      continue
    }
    await hand(page).getByRole('button').first().click()
  }
  throw new Error('The game did not end within 600 clicks')
}

test('shows the end panel when the game ends; replay and new game work', async ({ page }) => {
  test.setTimeout(120_000)
  await page.goto('/?hero=warrior&seed=3')
  const firstHand = await handNames(page)
  await playToTheEnd(page)

  const end = page.getByLabel('Game over')
  await expect(end.getByRole('heading')).toHaveText(/Victory!|Defeat/)
  await expect(end).toContainText('Seed3')
  await expect(page.getByLabel('Controls')).toHaveCount(0)
  // The final board and the log stay on screen under the end panel.
  await expect(page.getByLabel('Game log')).toContainText('Round 1')

  await end.getByRole('button', { name: 'Play this deal again' }).click()
  await expect(page.getByLabel('Game over')).toHaveCount(0)
  await expect(page.getByLabel('Controls')).toContainText('Round 1, play 1 of 2')
  await expect(page.getByLabel('Game log')).toContainText('Nothing has happened yet.')
  expect(await handNames(page)).toEqual(firstHand)

  await playToTheEnd(page)
  await page.getByRole('button', { name: 'New game' }).click()
  await expect(page.getByText('Choose your hero')).toBeVisible()
  await expect(page).toHaveURL(/\/$/)
})
