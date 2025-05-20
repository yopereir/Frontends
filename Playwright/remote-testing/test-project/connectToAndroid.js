import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://example.com');
  await page.screenshot({ path: 'android.png' });

  await browser.close();
})();
