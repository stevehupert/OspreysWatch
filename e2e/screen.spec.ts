import { expect, test } from '@playwright/test'

test('shows a fresh game for the hero and seed in the address', async ({ page }) => {
  await page.goto('/?hero=mage&seed=7')
  await expect(page.getByRole('heading', { name: 'The Sunken Crypt' })).toBeVisible()
  await expect(page.getByLabel('Status')).toContainText('Mage')
  await expect(page.getByLabel('Hand').locator('.card')).toHaveCount(5)
})

test('fits the page to the screen width; only the map scrolls sideways', async ({ page }) => {
  await page.goto('/')
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBe(0)
})
