import { remote } from 'webdriverio';

(async () => {
  const capabilities = {
    platformName: 'iOS',
    'appium:platformVersion': '18.5', // e.g., '15.0', '16.2'
    'appium:deviceName': 'iPhone',   // e.g., 'iPhone 13', 'iPad Pro (12.9-inch) (5th generation)'
    'appium:automationName': 'XCUITest',
    'browserName': 'Safari', // To automate Safari browser
    'appium:udid': '00008101-000A451C360A001E', // Optional: if you have multiple devices/simulators connected
    // 'appium:wdaLocalPort': 8100, // Optional: If WebDriverAgent on the device is running on a non-default port
    // 'appium:derivedDataPath': '/path/to/your/DerivedData/WebDriverAgent', // Optional: Can sometimes help with stability
  };

  const driver = await remote({
    protocol: 'http',
    hostname: '127.0.0.1', // Or your Appium server IP
    port: 4723,           // Default Appium port
    path: '/',      // Default Appium path (can sometimes be just '/')
    capabilities: capabilities,
    logLevel: 'info', // Optional: for detailed logs
  });

  try {
    console.log('Session created successfully!');

    // Navigate to the URL
    await driver.url('https://example.com');
    console.log('Navigated to example.com');

    // Take a screenshot
    await driver.saveScreenshot('./ios_safari.png');
    console.log('Screenshot saved as ios_safari.png');

  } catch (err) {
    console.error('An error occurred:', err);
  } finally {
    // End the session
    if (driver) {
      await driver.deleteSession();
      console.log('Session closed.');
    }
  }
})();