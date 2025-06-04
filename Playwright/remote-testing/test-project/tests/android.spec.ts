// example.spec.js
const { test, expect } = require('../_fixtures/fixtures'); // Adjust path if needed

test.describe('Android Page Tests', () => {
  // This test will use the 'androidPage' fixture
  test('should navigate to Playwright website', async ({ androidPage }) => {
    await androidPage.goto('https://playwright.dev/');
    await expect(androidPage).toHaveTitle(/Playwright/);
    console.log('Test: Page title is correct.');
    await androidPage.screenshot({ path: 'android-playwright-dev.png' });
    console.log('Test: Screenshot taken.');
  });

  test('should interact with example.com', async ({ androidPage }) => {
    await androidPage.goto('https://example.com/');
    const heading = await androidPage.locator('h1').textContent();
    expect(heading).toBe('Example Domain');
    console.log('Test: Heading on example.com is correct.');
  });
});