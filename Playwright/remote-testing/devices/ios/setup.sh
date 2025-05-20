#!/bin/bash

# === PRE-REQUISITES ===
brew list carthage libimobiledevice ios-deploy || brew install carthage libimobiledevice ios-deploy

# === CONFIG ===
SCHEME="WebDriverAgentRunner"
PROJECT="WebDriverAgent.xcodeproj"
DESTINATION=""
DEVELOPER_TEAM_ID="BGEA" # <- CHANGE THIS
BUNDLE_ID="com.yourcompany.WebDriverAgentRunner" # <- UNIQUE BUNDLE ID
DEVICE_UDID=$(xcrun xctrace list devices | grep -oE '[0-9A-Fa-f-]{40}' | head -1)

# Check for UDID
if [ -z "$DEVICE_UDID" ]; then
  echo "❌ No iOS device found. Please connect one via USB."
  exit 1
fi

echo "✅ Found device: $DEVICE_UDID"

# Install dependencies
echo "📦 Bootstrapping Carthage..."
carthage bootstrap --platform iOS --use-xcframeworks

# Build and install WDA
echo "🚀 Building WebDriverAgent for device..."

xcodebuild \
  -project "$PROJECT" \
  -scheme "$SCHEME" \
  -destination "id=$DEVICE_UDID" \
  -allowProvisioningUpdates \
  -derivedDataPath ./build \
  DEVELOPMENT_TEAM="$DEVELOPER_TEAM_ID" \
  PRODUCT_BUNDLE_IDENTIFIER="$BUNDLE_ID" \
  clean test-without-building build-for-testing

echo "✅ WDA built and installed on device."

# Optional: proxy WDA port (8100) to local machine
echo "🔌 Starting iproxy to forward localhost:8100 -> device:8100"
pkill iproxy 2>/dev/null
iproxy 8100 8100 "$DEVICE_UDID" &
sleep 2

# Check WDA status
echo "🧪 Checking WebDriverAgent status..."
curl --silent http://localhost:8100/status | jq

echo "🚦 WebDriverAgent is now running on http://localhost:8100"
