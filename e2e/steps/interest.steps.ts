import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { When, Then } = createBdd();

const LEVEL: Record<string, string> = { in: 'YES', maybe: 'MAYBE', pass: 'NO' };

/** The first destination card on the board (sorted by interest). */
const firstCard = (page: import('@playwright/test').Page) => page.getByTestId('dest-item').first();

When('the visitor votes {string} on the first destination', async ({ page }, choice: string) => {
  await firstCard(page).getByTestId(`vote-${LEVEL[choice]}`).click();
  // Let the optimistic write + refetch settle before the next action/assertion.
  await page.waitForTimeout(500);
});

Then('the vote buttons are disabled', async ({ page }) => {
  await expect(firstCard(page).getByTestId('vote-YES')).toBeDisabled({ timeout: 15_000 });
});

Then("the first destination shows the member's vote as chosen", async ({ page }) => {
  await expect(firstCard(page).getByTestId('vote-YES')).toHaveAttribute('aria-pressed', 'true', {
    timeout: 15_000,
  });
});

Then('the first destination\'s tally counts at least one "in"', async ({ page }) => {
  const text = await firstCard(page).getByTestId('vote-tally').innerText();
  const inCount = Number(text.match(/(\d+)\s+in/)?.[1] ?? '0');
  expect(inCount).toBeGreaterThanOrEqual(1);
});

Then(
  "the member's chosen vote on the first destination is {string}",
  async ({ page }, choice: string) => {
    await expect(firstCard(page).getByTestId(`vote-${LEVEL[choice]}`)).toHaveAttribute(
      'aria-pressed',
      'true',
      { timeout: 15_000 },
    );
  },
);
