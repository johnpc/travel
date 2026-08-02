import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { When, Then } = createBdd();

// Unique per run so re-runs on the shared sandbox don't collide.
const suffix = ` ${Date.now()}`;
const uniq = (name: string) => `${name}${suffix}`;

const itin = (page: import('@playwright/test').Page) => page.getByTestId('itinerary');

// The itinerary starts as a compact teaser on a single-destination trip — open it
// so the route editor (add form, AI button, list) is present. No-op once opened.
async function openItinerary(page: import('@playwright/test').Page) {
  const teaser = itin(page).getByTestId('itinerary-open');
  if (await teaser.isVisible().catch(() => false)) await teaser.click();
}

When('the visitor adds the stop {string}', async ({ page }, name: string) => {
  await page.getByTestId('trip-title').waitFor({ timeout: 15_000 });
  await openItinerary(page);
  await itin(page).getByTestId('stop-place').locator('input').fill(uniq(name));
  await itin(page).getByTestId('stop-add').click();
  await expect(
    itin(page)
      .getByTestId('stop-row')
      .filter({ hasText: uniq(name) }),
  ).toBeVisible({ timeout: 30_000 });
});

Then('the itinerary lists {string} before {string}', async ({ page }, a: string, b: string) => {
  const places = await itin(page).getByTestId('stop-row').allInnerTexts();
  const ia = places.findIndex((t) => t.includes(uniq(a)));
  const ib = places.findIndex((t) => t.includes(uniq(b)));
  expect(ia).toBeGreaterThanOrEqual(0);
  expect(ib).toBeGreaterThanOrEqual(0);
  expect(ia).toBeLessThan(ib);
});

When('the visitor moves {string} earlier', async ({ page }, name: string) => {
  const row = itin(page)
    .getByTestId('stop-row')
    .filter({ hasText: uniq(name) });
  await row.getByTestId('stop-up').click();
  await page.waitForTimeout(1500); // reorder round-trips two updates
});

When('the visitor removes the stop {string}', async ({ page }, name: string) => {
  const row = itin(page)
    .getByTestId('stop-row')
    .filter({ hasText: uniq(name) });
  await row.getByTestId('stop-remove').click();
  await page.locator('ion-alert').getByRole('button', { name: 'Remove', exact: true }).click();
});

Then('{string} is gone from the itinerary', async ({ page }, name: string) => {
  await expect(
    itin(page)
      .getByTestId('stop-row')
      .filter({ hasText: uniq(name) }),
  ).toHaveCount(0, { timeout: 30_000 });
});

When('the visitor asks AI to suggest a route', async ({ page }) => {
  await page.getByTestId('trip-title').waitFor({ timeout: 15_000 });
  await openItinerary(page);
  await itin(page).getByTestId('route-suggest').click();
});

Then('at least one route suggestion is shown', async ({ page }) => {
  await expect(itin(page).getByTestId('route-suggestion').first()).toBeVisible({ timeout: 45_000 });
});

When('the visitor adds the first route suggestion', async ({ page }) => {
  await itin(page).getByTestId('route-accept').first().click();
  await page.waitForTimeout(1500);
});

Then('the itinerary has at least one stop', async ({ page }) => {
  await expect(itin(page).getByTestId('stop-row').first()).toBeVisible({ timeout: 30_000 });
});
