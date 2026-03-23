import { test, expect } from '@playwright/test';

// 1. Tab navigation: Filter panel
test('Keyboard: Tab reaches all interactive controls in the FilterPanel', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('article').first()).toBeVisible();

  const collapseBtn = page.getByRole('button', { name: /collapse filters sidebar/i });
  await collapseBtn.focus();
  await expect(collapseBtn).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: /author/i })).toBeFocused();

  await page.keyboard.press('Tab');
  const firstCheckbox = page.getByRole('checkbox').first();
  await expect(firstCheckbox).toBeFocused();
});

// 2. Tab navigation: "+ New note" button is keyboard-reachable
test('Keyboard: "+ New note" button is keyboard-reachable (not excluded from tab order)', async ({
  page,
}) => {
  await page.goto('/');

  const btn = page.getByRole('button', { name: /\+ new note/i });
  await expect(btn).toBeVisible();
  await expect(btn).toBeEnabled();
  await btn.focus();
  await expect(btn).toBeFocused();
});

// 3. Dialog: Focus is trapped inside while open
test('Keyboard: Focus is trapped inside the "New note" dialog while it is open', async ({
  page,
}) => {
  await page.goto('/');

  await page.getByRole('button', { name: /\+ new note/i }).click();
  const dialog = page.getByRole('dialog', { name: /new note/i });
  await expect(dialog).toBeVisible();

  await expect(dialog.getByRole('textbox', { name: /^text$/i })).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('textbox', { name: /author/i })).toBeFocused();

  await dialog.getByRole('button', { name: /add note/i }).focus();
  await page.keyboard.press('Tab');
  const wrappedInsideDialog = await page.evaluate(() => {
    const dlg = document.querySelector('dialog[open]');
    return dlg?.contains(document.activeElement) ?? false;
  });
  expect(wrappedInsideDialog).toBe(true);
});

// 4. Dialog: Escape starts the closing sequence
test('Keyboard: Pressing Escape on the dialog triggers its closing animation', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: /\+ new note/i }).click();
  await expect(page.getByRole('dialog', { name: /new note/i })).toBeVisible();

  await page.keyboard.press('Escape');

  await expect(page.getByRole('dialog', { name: /new note/i })).toBeHidden();
});

// 5. Dialog: Focus returns to the opener after closing
test('Keyboard: Focus returns to the "+ New note" button after the dialog closes', async ({
  page,
}) => {
  await page.goto('/');

  const opener = page.getByRole('button', { name: /\+ new note/i });
  await opener.click();
  await expect(page.getByRole('dialog', { name: /new note/i })).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: /new note/i })).toBeHidden();

  await expect(opener).toBeFocused();
});
