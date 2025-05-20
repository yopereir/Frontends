# Remote Testing
This repo maintains all the code for setting up remote testing on android, iOS and other devices that are intended to be outside of the BGEA network.

# Conventions
- All setup for connecting to devices and configuring them are present in `devices` folder, with each device having their own sub-folder.
- All tests that you want to test against the device should be present in the `test-project` folder.

# How Tos
## Setup device to test
- Connect the device via USB to your computer and enable USB Debugging.
- Run `setup.sh` script in `devices/android/`. Then run tests.

## Run simple test
- `cd` into `test-project` folder and run `npm i` to install all test dependencies.
- Run `node connectToAndroid.js` to connect to android devices.