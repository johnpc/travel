import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { When, Then } = createBdd();

const firstCard = (page: import('@playwright/test').Page) => page.getByTestId('dest-item').first();

let keptTitle = '';

When('the visitor expands things to do on the first destination', async ({ page }) => {
  await firstCard(page).getByTestId('dest-activities-toggle').click();
  await expect(firstCard(page).getByTestId('activities')).toBeVisible({ timeout: 15_000 });
});

When('the visitor asks AI to suggest activities', async ({ page }) => {
  await firstCard(page).getByTestId('act-suggest').click();
});

When('the visitor keeps the first activity suggestion', async ({ page }) => {
  const first = firstCard(page).getByTestId('act-suggestion').first();
  keptTitle = (await first.locator('.acts__title').innerText()).trim();
  await first.getByTestId('act-accept').click();
  await page.waitForTimeout(500);
});

Then('at least one activity suggestion is shown', async ({ page }) => {
  await expect(firstCard(page).getByTestId('act-suggestion').first()).toBeVisible({
    timeout: 30_000,
  });
});

Then("the kept activity appears in the destination's activity list", async ({ page }) => {
  // .first() — the shared sandbox can accumulate same-named activities across
  // runs; the scenario only needs the kept one to be present.
  await expect(
    firstCard(page).getByTestId('act-item').filter({ hasText: keptTitle }).first(),
  ).toBeVisible({ timeout: 15_000 });
});

Then('the kept activity links to a GetYourGuide search', async ({ page }) => {
  const item = firstCard(page).getByTestId('act-item').filter({ hasText: keptTitle }).first();
  await expect(item.getByTestId('act-gyg')).toHaveAttribute('href', /getyourguide\.com\/s\/\?q=/);
});

When('the visitor removes the kept activity', async ({ page }) => {
  page.once('dialog', (d) => d.accept()); // the item confirms before deleting
  const item = firstCard(page).getByTestId('act-item').filter({ hasText: keptTitle }).first();
  await item.getByTestId('act-remove').click();
});

Then('the kept activity is gone from the activity list', async ({ page }) => {
  await expect(firstCard(page).getByTestId('act-item').filter({ hasText: keptTitle })).toHaveCount(
    0,
    { timeout: 15_000 },
  );
});
