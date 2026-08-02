import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { When, Then } = createBdd();

When('the visitor copies the trip link', async ({ page, context }) => {
  // Grant clipboard write + ensure the fallback (clipboard) path runs by
  // removing any native share sheet before the app loads.
  await context.grantPermissions(['clipboard-write']).catch(() => {});
  await page.addInitScript(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (navigator as any).share;
  });
  await page.reload();
  await page.getByTestId('share-trip').click();
});

Then('the plan names a front-runner destination', async ({ page }) => {
  // The headline reads like an invitation: "{Destination} with {crew}".
  await expect(page.getByTestId('plan-frontrunner')).toContainText('Santorini', {
    timeout: 15_000,
  });
});

Then('the plan invites booking the trip', async ({ page }) => {
  await expect(page.getByTestId('plan-book')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId('book-flights')).toBeVisible();
  await expect(page.getByTestId('book-hotels')).toBeVisible();
});

Then('the plan shows a best-dates line', async ({ page }) => {
  await expect(page.getByTestId('plan-dates')).toBeVisible({ timeout: 15_000 });
});

Then('the plan shows a budget line', async ({ page }) => {
  await expect(page.getByTestId('plan-budget')).toBeVisible({ timeout: 15_000 });
});

Then('the share button confirms it copied', async ({ page }) => {
  await expect(page.getByTestId('share-trip')).toContainText('Copied!', { timeout: 15_000 });
});
