import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Then } = createBdd();

const firstCard = (page: import('@playwright/test').Page) => page.getByTestId('dest-item').first();

Then('the first destination shows a photo automatically', async ({ page }) => {
  // A visual renders with no interaction — either the real-photo carousel
  // (default) or a group-generated AI view if one's been made. Assert an <img>
  // with an http(s) src inside the card's image area.
  const photo = firstCard(page).locator(
    '[data-testid="carousel-photo"], [data-testid="dest-image-img"]',
  );
  await expect(photo.first()).toBeVisible({ timeout: 20_000 });
  await expect(photo.first()).toHaveAttribute('src', /^https?:\/\//);
});

Then('the destination offers to reimagine the view with AI', async ({ page }) => {
  await expect(firstCard(page).getByTestId('dest-image-gen')).toBeVisible({ timeout: 15_000 });
});
