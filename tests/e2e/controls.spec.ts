import { test, expect } from '@playwright/test';

test.describe('Control Panel Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should toggle between Sheet and Board mode', async ({ page }) => {
    const sheetBtn = page.locator('button', { hasText: 'Sheet' });
    const boardBtn = page.locator('button', { hasText: 'Board' });
    
    // Sheet should be active by default
    await expect(sheetBtn).toHaveClass(/bg-blue-600/);
    
    // Click Board mode
    await boardBtn.click();
    await expect(boardBtn).toHaveClass(/bg-blue-600/);
    await expect(sheetBtn).not.toHaveClass(/bg-blue-600/);
    
    // Click back to Sheet mode
    await sheetBtn.click();
    await expect(sheetBtn).toHaveClass(/bg-blue-600/);
    await expect(boardBtn).not.toHaveClass(/bg-blue-600/);
  });

  test('should adjust column count slider', async ({ page }) => {
    const columnSlider = page.locator('input[type="range"]').first();
    const columnValue = page.locator('text=/Column Count:/');
    
    // Check initial value
    await expect(columnValue).toContainText('6');
    
    // Move slider to 8
    await columnSlider.fill('8');
    await expect(columnValue).toContainText('8');
    
    // Move slider to 4
    await columnSlider.fill('4');
    await expect(columnValue).toContainText('4');
  });

  test('should adjust master kanji size slider', async ({ page }) => {
    const sizeSlider = page.locator('input[type="range"]').nth(1);
    const sizeValue = page.locator('text=/Master Kanji Size:/');
    
    // Check initial value
    await expect(sizeValue).toContainText('150');
    
    // Move slider to 170
    await sizeSlider.fill('170');
    await expect(sizeValue).toContainText('170');
    
    // Move slider to 130
    await sizeSlider.fill('130');
    await expect(sizeValue).toContainText('130');
  });
});
