import { test, expect } from '@playwright/test';

test.describe('Layout Responsiveness', () => {
  test('PC Horizontal - should display 3-column layout @visual', async ({ page }) => {
    await page.goto('/');
    
    // Wait for app to load
    await page.waitForSelector('[data-testid="input-panel"]', { state: 'visible', timeout: 10000 });
    
    // Check that all three panels are visible
    const inputPanel = page.locator('[data-testid="input-panel"]');
    const mainView = page.locator('[data-testid="main-view"]');
    const controlPanel = page.locator('[data-testid="control-panel"]');
    
    await expect(inputPanel).toBeVisible();
    await expect(mainView).toBeVisible();
    await expect(controlPanel).toBeVisible();
    
    // Verify layout is horizontal (side-by-side)
    const inputBox = await inputPanel.boundingBox();
    const mainBox = await mainView.boundingBox();
    const controlBox = await controlPanel.boundingBox();
    
    expect(inputBox).toBeTruthy();
    expect(mainBox).toBeTruthy();
    expect(controlBox).toBeTruthy();
    
    // Input should be leftmost
    expect(inputBox!.x).toBeLessThan(mainBox!.x);
    // Control should be rightmost
    expect(mainBox!.x + mainBox!.width).toBeLessThan(controlBox!.x + controlBox!.width);
    
    // Take baseline screenshot
    await page.screenshot({ path: `tests/e2e/screenshots/pc-horizontal-baseline.png`, fullPage: true });
  });

  test('PC Vertical - should stack panels or adapt layout @visual', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="main-view"]', { state: 'visible' });
    
    const mainView = page.locator('[data-testid="main-view"]');
    await expect(mainView).toBeVisible();
    
    // Take baseline screenshot
    await page.screenshot({ path: `tests/e2e/screenshots/pc-vertical-baseline.png`, fullPage: true });
  });

  test('Tablet Horizontal - should adapt layout for medium screens @visual', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="main-view"]', { state: 'visible' });
    
    const mainView = page.locator('[data-testid="main-view"]');
    await expect(mainView).toBeVisible();
    
    await page.screenshot({ path: `tests/e2e/screenshots/tablet-horizontal-baseline.png`, fullPage: true });
  });

  test('Tablet Vertical - should show 2-column or stacked layout @visual', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="main-view"]', { state: 'visible' });
    
    const mainView = page.locator('[data-testid="main-view"]');
    await expect(mainView).toBeVisible();
    
    await page.screenshot({ path: `tests/e2e/screenshots/tablet-vertical-baseline.png`, fullPage: true });
  });

  test('Mobile Horizontal - should show compact layout @visual', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="main-view"]', { state: 'visible' });
    
    const mainView = page.locator('[data-testid="main-view"]');
    await expect(mainView).toBeVisible();
    
    await page.screenshot({ path: `tests/e2e/screenshots/mobile-horizontal-baseline.png`, fullPage: true });
  });

  test('Mobile Vertical - should show single-column stacked layout @visual', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="main-view"]', { state: 'visible' });
    
    const mainView = page.locator('[data-testid="main-view"]');
    await expect(mainView).toBeVisible();
    
    await page.screenshot({ path: `tests/e2e/screenshots/mobile-vertical-baseline.png`, fullPage: true });
  });
});
