import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { When, Then } = createBdd();

const chat = (page: import('@playwright/test').Page) => page.getByTestId('chat');

When('the visitor posts the message {string}', async ({ page }, body: string) => {
  await chat(page).getByTestId('chat-input').locator('input').fill(body);
  await chat(page).getByTestId('chat-send').click();
});

Then('the message {string} appears in the discussion', async ({ page }, body: string) => {
  // 30s: the shared sandbox's observeQuery sync can lag on a busy thread.
  await expect(chat(page).getByTestId('chat-message').filter({ hasText: body })).toBeVisible({
    timeout: 30_000,
  });
});

Then('the discussion asks you to pick your name', async ({ page }) => {
  await expect(chat(page).getByTestId('chat-gate')).toBeVisible({ timeout: 15_000 });
});
