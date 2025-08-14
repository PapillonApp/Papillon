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
echo "===== Running expo prebuild ====="
npx expo prebuild --no-install
echo "===== Running pod install ====="
cd ios
pod install