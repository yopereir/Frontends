#!/bin/bash

# === PRE-REQUISITES ===
brew list android-platform-tools || brew install android-platform-tools

# === CONFIG ===
LOCAL_PORT=9222
# Default browser: Chrome
BROWSER="Chrome"
DEVICE_SOCKET="localabstract:chrome_devtools_remote"
PACKAGE_NAME="com.android.chrome"

while test $# -gt 0; do
  case "$1" in
    -b|--browser)
      shift
      if test $# -gt 0; then
        case "$1" in
          chrome)
            echo "Using browser: $1"
            BROWSER="Chrome"
            DEVICE_SOCKET="localabstract:chrome_devtools_remote"
            PACKAGE_NAME="com.android.chrome"
            shift
            ;;
          vanadium)
            echo "Using browser: $1"
            BROWSER="Vanadium"
            DEVICE_SOCKET="localabstract:chrome_devtools_remote" #ALT "localabstract:org.chromium.webview_devtools_remote"
            PACKAGE_NAME="app.vanadium.browser"
            shift
            ;;
          *)
            echo "No browser specified. Using default browser: Chrome"
            break
            ;;
        esac
      else
        echo "No browser specified. Using default browser: Chrome"
        break
      fi
      shift
      ;;
    *)
      break
      ;;
  esac
done

# === CHECKS ===

# 1. Check for adb
if ! command -v adb &> /dev/null; then
    echo "❌ ADB not found. Install it with: brew install android-platform-tools"
    exit 1
fi

# 2. Check for connected device
DEVICE_ID=$(adb devices | awk 'NR==2 {print $1}')
if [ -z "$DEVICE_ID" ]; then
    echo "❌ No Android device detected. Connect a device and enable USB debugging."
    exit 1
fi
echo "✅ Android device detected: $DEVICE_ID"

# 3. Start browser
echo "📦 Checking if $BROWSER is installed..."
if ! adb shell pm list packages | grep -q "$PACKAGE_NAME"; then
    echo "❌ $BROWSER ($PACKAGE_NAME) is not installed on the device."
    exit 1
fi
echo "🚀 Launching $BROWSER browser..."
adb shell am force-stop "$PACKAGE_NAME"
adb shell am start "$PACKAGE_NAME"
adb shell monkey -p "$PACKAGE_NAME" -c android.intent.category.LAUNCHER 1
sleep 2

# 4. Test connection
## Forward port to device's browser DevTools interface
echo "🔌 Setting up ADB port forwarding (localhost:$LOCAL_PORT -> $DEVICE_SOCKET)..."
adb forward tcp:$LOCAL_PORT $DEVICE_SOCKET
adb -d forward tcp:9222 localabstract:chrome_devtools_remote # Used for Vanadium
echo "🌐 Testing connection..."
RESPONSE=$(curl -s http://localhost:$LOCAL_PORT/json/version)

if [[ $RESPONSE == *"Chrome"* ]]; then
    echo "🎉 Success: Chrome DevTools Protocol is reachable on port $LOCAL_PORT."
else
    echo "❌ Failed to reach browser DevTools. Make sure browser is installed and running."
    exit 1
fi

echo "🚀 You're ready to run Playwright tests via chromium.connectOverCDP!"
