import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { When, Then } = createBdd();

// A destination name unique to this run so re-runs don't collide on the board.
let manualName = '';
let acceptedName = '';

When('the visitor adds the destination {string}', async ({ page }, name: string) => {
  manualName = `${name} ${Date.now()}`;
  await page.getByTestId('dest-name').locator('input').fill(manualName);
  await page.getByTestId('dest-add').click();
});

When(
  'a visitor opens the trip {string} with destination reads failing',
  async ({ page }, slug: string) => {
    // Fail ONLY the Destination list query so the trip + roster still load —
    // proves the destinations section's own error path.
    await page.route('**/graphql', async (route) => {
      const body = route.request().postData() ?? '';
      if (body.includes('listDestinations') || body.includes('Destination')) {
        return route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: '{"errors":[{"message":"boom"}]}',
        });
      }
      return route.continue();
    });
    await page.goto(`/${slug}`);
  },
);

When('the visitor asks AI to suggest destinations', async ({ page }) => {
  await page.getByTestId('suggest-btn').click();
});

When('the visitor accepts the first AI suggestion', async ({ page }) => {
  const first = page.getByTestId('suggest-item').first();
  acceptedName = (await first.getByTestId('suggest-item-name').innerText()).trim();
  await first.getByTestId('suggest-accept').click();
});

Then('{string} appears on the destination board', async ({ page }, name: string) => {
  const shown = name.startsWith('Lisbon') ? manualName : name;
  await expect(page.getByTestId('dest-item').filter({ hasText: shown })).toBeVisible({
    timeout: 15_000,
  });
});

Then('at least one AI suggestion is shown', async ({ page }) => {
  await expect(page.getByTestId('suggest-item').first()).toBeVisible({ timeout: 30_000 });
});

Then('the accepted suggestion appears on the destination board', async ({ page }) => {
  await expect(page.getByTestId('dest-item').filter({ hasText: acceptedName })).toBeVisible({
    timeout: 15_000,
  });
});

Then('the destinations section shows a retry', async ({ page }) => {
  await expect(page.getByTestId('load-error')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId('load-retry')).toBeVisible();
});

When('the visitor removes that destination', async ({ page }) => {
  // The card asks for confirm() before deleting — accept it.
  page.once('dialog', (d) => d.accept());
  const card = page.getByTestId('dest-item').filter({ hasText: manualName });
  await card.getByTestId('dest-remove').click();
});

Then('that destination is gone from the board', async ({ page }) => {
  await expect(page.getByTestId('dest-item').filter({ hasText: manualName })).toHaveCount(0, {
    timeout: 15_000,
  });
});
