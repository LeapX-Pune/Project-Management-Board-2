import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test('UI loads and basic interactions work', async ({ page }) => {
  await page.goto(BASE_URL);

  await page.waitForSelector('.column', { timeout: 5000 });

  const columns = page.locator('.column');
  await expect(columns).toHaveCount(5);

  const firstColumnTitle = page.locator('.column').first().locator('.column-title');
  await expect(firstColumnTitle).toHaveText('Backlog');

  const taskCards = page.locator('.task-card');
  await expect(taskCards).toHaveCount(6);

  await page.click('#add-task-btn');
  await expect(page.locator('#task-modal')).toHaveClass(/open/);

  await page.fill('input[name="title"]', 'Test Task');
  await page.fill('textarea[name="description"]', 'Task created by automated test');
  await page.selectOption('select[name="assignee"]', 'alice');
  await page.fill('input[name="dueDate"]', '2026-08-15');
  await page.selectOption('select[name="priority"]', 'medium');

  const backlog = page.locator('.column', { hasText: 'Backlog' });
  await expect(backlog).toBeVisible();
});

test('theme toggle works', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForSelector('#theme-toggle');

  await expect(page.locator('body')).not.toHaveClass(/dark-theme/);
  await page.click('#theme-toggle');
  await expect(page.locator('body')).toHaveClass(/dark-theme/);
  await page.click('#theme-toggle');
  await expect(page.locator('body')).not.toHaveClass(/dark-theme/);
});

test('view switching works', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForSelector('.view-btn');

  const boardView = page.locator('#board-view');
  const tableView = page.locator('#table-view');
  const listView = page.locator('#list-view');

  await expect(boardView).toHaveClass(/active/);
  await expect(tableView).not.toHaveClass(/active/);
  await expect(listView).not.toHaveClass(/active/);

  await page.click('.view-btn[data-view="table"]');
  await expect(tableView).toHaveClass(/active/);
  await expect(boardView).not.toHaveClass(/active/);

  await page.click('.view-btn[data-view="list"]');
  await expect(listView).toHaveClass(/active/);
  await expect(tableView).not.toHaveClass(/active/);
});

test('sidebar collapse works', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForSelector('#sidebar-collapse');

  await expect(page.locator('#sidebar')).not.toHaveClass(/collapsed/);
  await page.click('#sidebar-collapse');
  await expect(page.locator('#sidebar')).toHaveClass(/collapsed/);
  await page.click('#sidebar-collapse');
  await expect(page.locator('#sidebar')).not.toHaveClass(/collapsed/);
});

test('subtask progress bar visible on cards', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForSelector('.task-card');

  const subtaskBars = page.locator('.task-subtask-bar');
  const count = await subtaskBars.count();
  expect(count).toBeGreaterThan(0);
});

test('team members render in sidebar', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForSelector('.team-member');

  const members = page.locator('.team-member');
  await expect(members).toHaveCount(4);

  const addGithub = page.locator('.team-member-github[data-action="edit-github"]');
  await expect(addGithub.first()).toBeVisible();

  await addGithub.first().click();
  await expect(page.locator('.team-member-edit-input')).toBeVisible();
});

test('task card has draggable attribute', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForSelector('.task-card');

  const firstCard = page.locator('.task-card').first();
  await expect(firstCard).toHaveAttribute('draggable', 'true');
});

test('side peek opens on edit click', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForSelector('.task-action-btn[data-action="edit"]');

  await page.locator('.task-action-btn[data-action="edit"]').first().click();
  await expect(page.locator('#side-peek')).toHaveClass(/open/);
});

test('search query filters cards', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForSelector('#search-input');

  const cards = page.locator('.task-card');
  const initialCount = await cards.count();
  expect(initialCount).toBe(6);

  await page.fill('#search-input', 'landing');

  const visibleCards = page.locator('.task-card:not([style*="display: none"])');
  const visibleCount = await visibleCards.count();
  expect(visibleCount).toBeLessThan(initialCount);
  expect(visibleCount).toBeGreaterThan(0);

  await page.fill('#search-input', '');
  const restoredCards = page.locator('.task-card:not([style*="display: none"])');
  const restoredCount = await restoredCards.count();
  expect(restoredCount).toBe(initialCount);
});

test('sidebar navigation switches to Dashboard view', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForSelector('.sidebar-nav .nav-item[data-section="dashboard"]');

  await page.click('.sidebar-nav .nav-item[data-section="dashboard"]');
  await expect(page.locator('#dashboard-view')).toHaveClass(/active/);
  await expect(page.locator('#board-view')).not.toHaveClass(/active/);

  await expect(page.locator('.metrics-grid')).toBeVisible();
  await expect(page.locator('.metric-card')).toHaveCount(4);
});

test('sidebar navigation switches to Calendar view', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForSelector('.sidebar-nav .nav-item[data-section="calendar"]');

  await page.click('.sidebar-nav .nav-item[data-section="calendar"]');
  await expect(page.locator('#calendar-view')).toHaveClass(/active/);
  await expect(page.locator('#board-view')).not.toHaveClass(/active/);

  await expect(page.locator('.calendar-month-grid')).toBeVisible();
  await expect(page.locator('.calendar-weekday')).toHaveCount(7);
});

test('sidebar navigation switches to Analytics view', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForSelector('.sidebar-nav .nav-item[data-section="analytics"]');

  await page.click('.sidebar-nav .nav-item[data-section="analytics"]');
  await expect(page.locator('#analytics-view')).toHaveClass(/active/);
  await expect(page.locator('#board-view')).not.toHaveClass(/active/);

  await expect(page.locator('.charts-grid')).toBeVisible();
  await expect(page.locator('.chart-card')).toHaveCount(3);
  await expect(page.locator('.member-stats-table')).toBeVisible();
});

test('returning to Board from other views shows previous sub-view', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForSelector('.view-btn');

  await page.click('.view-btn[data-view="table"]');
  await expect(page.locator('#table-view')).toHaveClass(/active/);

  await page.click('.sidebar-nav .nav-item[data-section="dashboard"]');
  await expect(page.locator('#dashboard-view')).toHaveClass(/active/);
  await expect(page.locator('#table-view')).not.toHaveClass(/active/);

  await page.click('.sidebar-nav .nav-item[data-section="board"]');
  await expect(page.locator('#table-view')).toHaveClass(/active/);
});

test('nav-item active-view class updates on sidebar click', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForSelector('.sidebar-nav .nav-item');

  const dashboardNav = page.locator('.sidebar-nav .nav-item[data-section="dashboard"]');
  await expect(page.locator('.sidebar-nav .nav-item.active-view')).toHaveAttribute('data-section', 'board');

  await dashboardNav.click();
  await expect(dashboardNav).toHaveClass(/active-view/);
});
