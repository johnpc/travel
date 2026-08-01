import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { When, Then } = createBdd();

// A slug unique to this run so the "create on first visit" scenario doesn't
// collide with a previous run's leftover trip.
let freshSlug = '';

When('a visitor opens the trip {string}', async ({ page }, slug: string) => {
  await page.goto(`/${slug}`);
  await expect(page).toHaveURL(new RegExp(`/${slug}$`));
});

When('a visitor opens a fresh trip with a random slug', async ({ page }) => {
  freshSlug = `e2e-${Date.now()}`;
  await page.goto(`/${freshSlug}`);
});

When(
  'a visitor opens the trip {string} with the network failing',
  async ({ page }, slug: string) => {
    await page.route('**/graphql', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: '{"errors":[{"message":"boom"}]}',
      }),
    );
    await page.goto(`/${slug}`);
  },
);

When('the visitor joins as {string}', async ({ page }, name: string) => {
  await page.getByTestId('join-name').locator('input').fill(name);
  await page.getByTestId('join-trip').click();
});

Then('the trip title {string} is shown', async ({ page }, title: string) => {
  await expect(page.getByTestId('trip-title')).toHaveText(title, { timeout: 15_000 });
});

Then('the trip title matching that slug is shown', async ({ page }) => {
  // A freshly-created trip is titled from its slug (no title was passed).
  await expect(page.getByTestId('trip-title')).toHaveText(freshSlug, { timeout: 15_000 });
});

Then('{string} is listed on the roster', async ({ page }, name: string) => {
  await expect(page.getByTestId('roster-member').filter({ hasText: name })).toBeVisible({
    timeout: 15_000,
  });
});

Then('the roster join form is offered', async ({ page }) => {
  await expect(page.getByTestId('join-name')).toBeVisible({ timeout: 15_000 });
});

Then('the app shows they are planning as {string}', async ({ page }, name: string) => {
  await expect(page.getByTestId('roster-you')).toContainText(name, { timeout: 15_000 });
});

Then('the trip shows a retry, not a blank screen', async ({ page }) => {
  await expect(page.getByTestId('load-error')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId('load-retry')).toBeVisible();
});
