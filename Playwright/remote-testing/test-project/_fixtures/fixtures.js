// android-fixtures.js
const { test: baseTest, chromium } = require('@playwright/test');

exports.test = baseTest.extend({
  androidPage: async ({}, use) => {
    // Prerequisite: Ensure a Chromium-based browser is running and
    // its Chrome DevTools Protocol (CDP) is accessible at http://localhost:9222.
    //
    // For a desktop browser, you might launch it like:
    // chrome.exe --remote-debugging-port=9222
    //
    // For an Android device/emulator (e.g., targeting Chrome):
    // 1. Ensure Chrome is running on the Android device.
    // 2. Forward the port: adb forward tcp:9222 localabstract:chrome_devtools_remote
    //    (The localabstract socket name might vary for other browsers like Vanadium or WebViews)

    let browser;
    try {
      console.log('Fixture: Connecting to browser over CDP at http://localhost:9222...');
      browser = await chromium.connectOverCDP('http://localhost:9222');
      console.log('Fixture: Connected to browser.');

      // Get the first existing context, or create a new one if none exist.
      // This handles cases where the browser might have been launched fresh without any pages/contexts,
      // or if it's an existing browser instance with open tabs/contexts.
      const context = browser.contexts().length > 0 ? browser.contexts()[0] : await browser.newContext();
      // Alternatively, the user's exact line:
      // const context = browser.contexts()[0] || (await browser.newContext());
      console.log('Fixture: Acquired browser context.');

      const page = await context.newPage();
      console.log('Fixture: New page created.');

      // Provide the page object to the test
      await use(page);

      // Teardown starts after the test finishes
      console.log('Fixture: Test finished, cleaning up page and context related to this fixture instance...');
      // Closing the page explicitly is good practice, though browser.close() would also clean it up.
      if (!page.isClosed()) {
        await page.close();
      }
      // If this context was created by the fixture, and not pre-existing, you might consider closing it.
      // However, if it was pre-existing (browser.contexts()[0]), closing it might affect other operations
      // outside this specific test if the browser is shared.
      // For simplicity and given connectOverCDP connects to an existing browser,
      // we often just rely on browser.close() to detach.
      // If you created the context (i.e., browser.contexts() was empty initially), then:
      // if (browser.contexts().length === 0) { // This check is tricky due to timing
      //    await context.close();
      // }
      // Given the setup, it's usually safer to just let browser.close() handle detachment.

    } catch (error) {
      console.error('Fixture: Error during androidPage setup or execution:', error);
      throw error; // Re-throw to fail the test
    } finally {
      if (browser) {
        console.log('Fixture: Disconnecting from browser (CDP connection)...');
        await browser.close(); // Disconnects from the browser
        console.log('Fixture: Disconnected.');
      }
    }
  },
});

// Re-export expect for convenience
exports.expect = require('@playwright/test').expect;