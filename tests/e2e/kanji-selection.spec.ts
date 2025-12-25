import { test, expect } from '@playwright/test';

test.describe('Kanji Selection and Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for data to load
    await page.waitForSelector('text=/JLPT-/', { timeout: 30000 });
  });

  test('should expand and collapse kanji sections', async ({ page }) => {
    // Find first section header
    const sectionHeader = page.locator('.bg-gray-700').first();
    await sectionHeader.click();
    
    // Section should expand - check for kanji grid
    const kanjiGrid = page.locator('.grid.grid-cols-4').first();
    await expect(kanjiGrid).toBeVisible();
    
    // Click again to collapse
    await sectionHeader.click();
    await expect(kanjiGrid).not.toBeVisible();
  });

  test('should select and deselect kanji', async ({ page }) => {
    // Expand first section
    const sectionHeader = page.locator('.bg-gray-700').first();
    await sectionHeader.click();
    
    // Click first kanji
    const firstKanji = page.locator('.grid.grid-cols-4 > div').first();
    await firstKanji.click();
    
    // Should appear in CHOSEN KANJIS section
    const chosenSection = page.locator('text=/CHOSEN KANJIS/');
    await expect(chosenSection).toContainText('(1)');
    
    // Kanji should have green border indicating selection
    await expect(firstKanji).toHaveClass(/border-green-500/);
    
    // Click again to deselect
    await firstKanji.click();
    await expect(chosenSection).toContainText('(0)');
    await expect(firstKanji).not.toHaveClass(/border-green-500/);
  });

  test('should add all kanji from section', async ({ page }) => {
    // Expand first section
    const sectionHeader = page.locator('.bg-gray-700').first();
    await sectionHeader.click();
    
    // Click "Add All" button
    const addAllBtn = page.locator('button', { hasText: 'Add All' }).first();
    await addAllBtn.click();
    
    // CHOSEN KANJIS should show multiple kanji
    const chosenSection = page.locator('text=/CHOSEN KANJIS \\(\\d+\\)/');
    const text = await chosenSection.textContent();
    const count = parseInt(text!.match(/\\d+/)![0]);
    expect(count).toBeGreaterThan(0);
  });

  test('should clear kanji from section', async ({ page }) => {
    // Expand first section and add all
    const sectionHeader = page.locator('.bg-gray-700').first();
    await sectionHeader.click();
    
    const addAllBtn = page.locator('button', { hasText: 'Add All' }).first();
    await addAllBtn.click();
    
    // Verify kanji were added
    const chosenSection = page.locator('text=/CHOSEN KANJIS \\(\\d+\\)/');
    let text = await chosenSection.textContent();
    let count = parseInt(text!.match(/\\d+/)![0]);
    expect(count).toBeGreaterThan(0);
    
    // Click "Clear" button
    const clearBtn = page.locator('button', { hasText: 'Clear' }).first();
    await clearBtn.click();
    
    // CHOSEN KANJIS should be empty
    await expect(chosenSection).toContainText('(0)');
  });

  test('should remove kanji by clicking in CHOSEN KANJIS section', async ({ page }) => {
    // Expand section and select a kanji
    const sectionHeader = page.locator('.bg-gray-700').first();
    await sectionHeader.click();
    
    const firstKanji = page.locator('.grid.grid-cols-4 > div').first();
    const kanjiText = await firstKanji.textContent();
    await firstKanji.click();
    
    // Find the kanji in CHOSEN KANJIS and click it
    const chosenKanji = page.locator('.bg-green-600').filter({ hasText: kanjiText!.trim() }).first();
    await chosenKanji.click();
    
    // Should be removed
    const chosenSection = page.locator('text=/CHOSEN KANJIS/');
    await expect(chosenSection).toContainText('(0)');
  });
});
