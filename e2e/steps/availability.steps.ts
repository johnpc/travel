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
  await page.getByTestId(`day-${fifteenth()}`).click();
  await page.waitForTimeout(500); // let the write + refetch settle
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
