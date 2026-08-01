import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { When, Then } = createBdd();

const firstCard = (page: import('@playwright/test').Page) => page.getByTestId('dest-item').first();

When('the visitor generates an image for the first destination', async ({ page }) => {
  await firstCard(page).getByTestId('dest-image-gen').click();
});

Then('the first destination shows a generated image', async ({ page }) => {
  // The live Bedrock image pipeline runs (generate → resize → S3 → persist →
  // getUrl), so allow generous time; then assert a real <img> with an http src.
  const img = firstCard(page).getByTestId('dest-image-img');
  await expect(img).toBeVisible({ timeout: 60_000 });
  await expect(img).toHaveAttribute('src', /^https?:\/\//);
});
