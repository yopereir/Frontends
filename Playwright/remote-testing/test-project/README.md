# Test project 
This is a test project for running Playwright tests on remote devices.

# How Tos
## Prequisites:
- If you haven't setup port forwarding of chrome_devtools from your android device, go to devices/android and run `./setup.sh -b chrome/vanadium` to port forward it to `localhost:9222`.
- Run `npm i` to install all test dependencies.

## Run simple test
- Run `node connectToAndroid.js` to connect to android devices.

## Run playwright tests
- Run `npx playwright test` to run all tests in `test` folder.