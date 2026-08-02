import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { When, Then } = createBdd();

// A fixed, far-future month that no fixture seeds into, so day-marking is
// deterministic no matter which month the calendar opens on (busiest-month).
const TARGET = { year: 2035, month: 12, label: 'December 2035' };
const targetDay = (d: number) => `2035-12-${String(d).padStart(2, '0')}`;

/** Page the calendar to the target clean month via the nav arrows. */
async function gotoTargetMonth(page: import('@playwright/test').Page) {
  for (let i = 0; i < 240; i++) {
    const title = (await page.getByTestId('cal-title').innerText()).trim();
    if (title === TARGET.label) return;
    await page.getByTestId('cal-next').click();
  }
}

let openingTitle = '';

When('the visitor marks the 15th of the current month free', async ({ page }) => {
  await gotoTargetMonth(page);
  // Single-day mode (the FREE→BUSY→MAYBE→clear cycle); tap until FREE, robust to
  // any leftover mark on the shared sandbox.
  await page.getByTestId('mode-single').click();
  const day = page.getByTestId(`day-${targetDay(15)}`);
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
  // Any visible day works — no identity means every cell is disabled.
  await expect(page.getByTestId('cal').getByRole('button').first()).toBeDisabled({
    timeout: 15_000,
  });
});

Then('the 15th shows the visitor as free', async ({ page }) => {
  await expect(page.getByTestId(`day-${targetDay(15)}`)).toHaveAttribute('data-mine', 'FREE', {
    timeout: 15_000,
  });
});

Then('the calendar shows a different month than it opened on', async ({ page }) => {
  await expect(page.getByTestId('cal-title')).not.toHaveText(openingTitle, { timeout: 15_000 });
});

let jumpedTitle = '';

When('the visitor marks a free range in the current month', async ({ page }) => {
  await gotoTargetMonth(page);
  // Default mode is range: tap start, tap end → whole span marked FREE.
  await page.getByTestId(`day-${targetDay(10)}`).click();
  await page.getByTestId(`day-${targetDay(12)}`).click();
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

// Map "Mar 14–21, 2027" (chip range) to its ISO first day for a day-cell lookup.
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
let breakLabel = '';
let breakFirstDay = '';

When('the visitor picks the first school-break quick-pick', async ({ page }) => {
  // The mark-mode buttons only render once identity has propagated to the panel;
  // wait for them so pickBreak actually marks (not just jumps).
  await page.getByTestId('mode-range').waitFor({ timeout: 15_000 });
  const chip = page.getByTestId('school-break').first();
  await chip.waitFor({ timeout: 15_000 });
  const range = (await chip.locator('.breaks__range').innerText()).trim(); // "Mar 14–21, 2027"
  const m = range.match(/^([A-Za-z]{3})\s+(\d+).*?(\d{4})$/);
  if (!m) throw new Error(`Unrecognized break range: ${range}`);
  const month = String(MON.indexOf(m[1]) + 1).padStart(2, '0');
  breakLabel = MON[MON.indexOf(m[1])];
  breakFirstDay = `${m[3]}-${month}-${m[2].padStart(2, '0')}`;
  await chip.click();
  await page.waitForTimeout(800); // jump + per-day FREE writes + live echo
});

Then("the calendar jumps to that break's month", async ({ page }) => {
  const title = (await page.getByTestId('cal-title').innerText()).trim();
  expect(title.slice(0, 3)).toBe(breakLabel);
});

Then("that break's first day shows the visitor as free", async ({ page }) => {
  await expect(page.getByTestId(`day-${breakFirstDay}`)).toHaveAttribute('data-mine', 'FREE', {
    timeout: 15_000,
  });
});
