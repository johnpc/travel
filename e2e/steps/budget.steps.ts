import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { When, Then } = createBdd();

const firstCard = (page: import('@playwright/test').Page) => page.getByTestId('dest-item').first();

async function fill(page: import('@playwright/test').Page, testid: string, value: string) {
  await firstCard(page).getByTestId(testid).locator('input').fill(value);
}

When(
  'the visitor enters a flight cost of {string} and lodging of {string} for {string} nights',
  async ({ page }, flight: string, lodging: string, nights: string) => {
    await fill(page, 'budget-flightPerPerson', flight);
    await fill(page, 'budget-lodgingPerNight', lodging);
    await fill(page, 'budget-nights', nights);
  },
);

When('the visitor saves the budget estimate', async ({ page }) => {
  await firstCard(page).getByTestId('budget-save').click();
  await page.waitForTimeout(600);
});

When(
  'the visitor reloads the trip {string} and expands the first destination',
  async ({ page }, slug: string) => {
    await page.goto(`/${slug}`);
    await firstCard(page).getByTestId('dest-activities-toggle').click();
    await expect(firstCard(page).getByTestId('budget')).toBeVisible({ timeout: 15_000 });
  },
);

Then('the per-person total shows {string}', async ({ page }, amount: string) => {
  await expect(firstCard(page).getByTestId('budget-per-person')).toHaveText(amount, {
    timeout: 15_000,
  });
});

Then('the per-couple total shows {string}', async ({ page }, amount: string) => {
  await expect(firstCard(page).getByTestId('budget-per-couple')).toHaveText(amount, {
    timeout: 15_000,
  });
});
