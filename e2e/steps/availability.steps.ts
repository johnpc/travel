import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { When, Then } = createBdd();

/** YYYY-MM-15 for the current month (the calendar opens on the current month). */
function fifteenth(): string {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${mm}-15`;
}

let openingTitle = '';

When('the visitor marks the 15th of the current month free', async ({ page }) => {
  // Use single-day mode (the FREE→BUSY→MAYBE→clear cycle); tap until the day
  // reaches FREE, robust to any leftover mark on the shared sandbox.
  await page.getByTestId('mode-single').click();
  const day = page.getByTestId(`day-${fifteenth()}`);
  for (let i = 0; i < 4; i++) {
    if ((await day.getAttribute('data-mine')) === 'FREE') break;
    await day.click();
    await page.waitForTimeout(500); // let the write + refetch settle
  }
});

When('the visitor goes to next month', async ({ page }) => {
  openingTitle = (await page.getByTestId('cal-title').innerText()).trim();
  await page.getByTestId('cal-next').click();
});

Then('the calendar days are not markable', async ({ page }) => {
  await expect(page.getByTestId(`day-${fifteenth()}`)).toBeDisabled({ timeout: 15_000 });
});

Then('the 15th shows the visitor as free', async ({ page }) => {
  // A single tap on an unmarked day cycles it to FREE (see nextStatus).
  await expect(page.getByTestId(`day-${fifteenth()}`)).toHaveAttribute('data-mine', 'FREE', {
    timeout: 15_000,
  });
});

Then('the calendar shows a different month than it opened on', async ({ page }) => {
  await expect(page.getByTestId('cal-title')).not.toHaveText(openingTitle, { timeout: 15_000 });
});

let jumpedTitle = '';

/** Two day stamps in the current month for a range (the 10th and 12th). */
function dayStamp(d: number): string {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${mm}-${String(d).padStart(2, '0')}`;
}

When('the visitor marks a free range in the current month', async ({ page }) => {
  // Default mode is range: tap start, tap end → whole span marked FREE.
  await page.getByTestId(`day-${dayStamp(10)}`).click();
  await page.getByTestId(`day-${dayStamp(12)}`).click();
  await page.waitForTimeout(800); // per-day writes + live echo
});

Then('a candidate date window is listed', async ({ page }) => {
  await expect(page.getByTestId('candidate-window').first()).toBeVisible({ timeout: 15_000 });
});

When('the visitor jumps to the first candidate window', async ({ page }) => {
  const first = page.getByTestId('candidate-window').first();
  jumpedTitle = (await first.locator('.cwins__range').innerText()).trim();
  await first.click();
});

Then("the calendar shows that window's month", async ({ page }) => {
  // The window label starts with a month abbreviation; the calendar title uses
  // the full month name — assert they share the first three letters.
  const title = (await page.getByTestId('cal-title').innerText()).trim();
  expect(title.slice(0, 3)).toBe(jumpedTitle.slice(0, 3));
});
