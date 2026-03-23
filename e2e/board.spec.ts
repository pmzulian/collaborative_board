import { test, expect } from '@playwright/test';

const API = 'http://localhost:3001';

// 1. Smoke
test('smoke: app loads and renders notes from the server', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /collaborative board explorer/i })).toBeVisible();

  await expect(page.getByRole('article').first()).toBeVisible();
});

// 2. Create
test('Create note: New note appears on the board immediately after submission', async ({
  page,
  request,
}) => {
  await page.goto('/');

  await expect(page.getByRole('article').first()).toBeVisible();
  const initialCount = await page.getByRole('article').count();

  await page.getByRole('button', { name: /\+ new note/i }).click();
  await expect(page.getByRole('dialog', { name: /new note/i })).toBeVisible();

  await page.getByRole('textbox', { name: /^text$/i }).fill('E2E test note — please ignore');
  await page.getByRole('textbox', { name: /author/i }).fill('user_e2e');
  await page.getByRole('button', { name: /add note/i }).click();

  await expect(page.getByRole('article')).toHaveCount(initialCount + 1);
  await expect(
    page.getByRole('article', { name: /note by user_e2e: e2e test note/i }),
  ).toBeVisible();

  const res = await request.get(`${API}/notes`);
  const all: Array<{ id: string; author: string }> = await res.json();
  const created = all.find((n) => n.author === 'user_e2e');
  if (created) await request.delete(`${API}/notes/${created.id}`);
});

// 3. Filter
test('Filter by author: Only notes from the selected author remain visible', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('article').first()).toBeVisible();

  await page.getByRole('checkbox', { name: /filter by user_1/i }).check();

  const visibleNotes = page.getByRole('article');
  await expect(visibleNotes.first()).toBeVisible();

  await expect(page.getByRole('article', { name: /note by user_2:/i })).toHaveCount(0);
  await expect(page.getByRole('article', { name: /note by user_3:/i })).toHaveCount(0);
});

// 4. Edit
test('Edit note: Updated text is persisted and shown on the board', async ({ page, request }) => {
  const originalText = 'Login flow is confusing — too many steps before reaching the dashboard';
  const updatedText = 'Login flow updated by E2E test — please ignore';

  await page.goto('/');

  const noteArticle = page.getByRole('article', {
    name: new RegExp(originalText.slice(0, 20), 'i'),
  });
  await expect(noteArticle).toBeVisible();

  await noteArticle.getByRole('button', { name: /edit note/i }).click();

  const textarea = noteArticle.getByRole('textbox', { name: /edit note text/i });
  await expect(textarea).toBeVisible();
  await textarea.fill(updatedText);
  await textarea.press('Enter');

  await expect(
    page.getByRole('article', { name: new RegExp(updatedText.slice(0, 20), 'i') }),
  ).toBeVisible();

  const res = await request.get(`${API}/notes`);
  const all: Array<{ id: string; text: string }> = await res.json();
  const note = all.find((n) => n.text === updatedText);
  if (note) {
    await request.patch(`${API}/notes/${note.id}`, {
      data: { text: originalText },
    });
  }
});

// 5. Delete
test('Delete note: Deleted note is removed from the board', async ({ page, request }) => {
  const created = await request.post(`${API}/notes`, {
    data: {
      text: 'E2E delete test — please ignore',
      author: 'user_e2e_delete',
      color: 'yellow',
      x: 0,
      y: 0,
      createdAt: new Date().toISOString(),
    },
  });
  const { id } = await created.json();

  await page.goto('/');

  const noteArticle = page.getByRole('article', { name: /e2e delete test/i });
  await expect(noteArticle).toBeVisible();

  await noteArticle
    .getByRole('button', { name: /delete note by user_e2e_delete/i })
    .click();

  await expect(page.getByRole('article', { name: /e2e delete test/i })).toHaveCount(0);

  await request.delete(`${API}/notes/${id}`).catch(() => {});
});
