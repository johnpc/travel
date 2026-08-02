import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { When, Then } = createBdd();

// A destination name unique to this run so re-runs don't collide on the board.
let manualName = '';
let acceptedName = '';

When('the visitor adds the destination {string}', async ({ page }, name: string) => {
  // Wait until the trip exists (title rendered) so a fresh-slug create has
  // settled before we add — otherwise the add mutation has no trip id yet.
  await page.getByTestId('trip-title').waitFor({ timeout: 15_000 });
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
  // 30s: the shared sandbox's observeQuery sync can lag on a busy board (matches
  // the AI-suggestion assertions' allowance) — this is propagation, not a bug.
  await expect(page.getByTestId('dest-item').filter({ hasText: shown })).toBeVisible({
    timeout: 30_000,
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
  const card = page.getByTestId('dest-item').filter({ hasText: manualName });
  await card.getByTestId('dest-remove').click();
  // A branded confirm alert appears — tap "Remove" inside it (scope to ion-alert
  // so we don't match the cards' own "Remove <name>" × buttons).
  await page.locator('ion-alert').getByRole('button', { name: 'Remove', exact: true }).click();
});

Then('that destination is gone from the board', async ({ page }) => {
  await expect(page.getByTestId('dest-item').filter({ hasText: manualName })).toHaveCount(0, {
    timeout: 30_000,
  });
});
