#!/bin/zsh

echo "===== Installling CocoaPods ====="
export HOMEBREW_NO_INSTALL_CLEANUP=TRUE
brew install cocoapods
echo "===== Installing Node.js ====="
brew install node

# Install dependencies
echo "===== Running npm install ====="
cd ../..
npm install --legacy-peer-deps
echo "===== Adding secrets ====="
printf "{\"APP_KEY\":\"%s\",\"SALT\":\"%s\",\"SERVER_URL\":\"%s\"}" "$APP_KEY" "$SALT" "$SERVER_URL" >> secrets.json
echo "===== Running expo prebuild ====="
npx expo prebuild --no-install
echo "===== Running git restore ====="
git restore .
echo "===== Running pod install ====="
cd ios
pod install