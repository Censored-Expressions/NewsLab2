$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Host "npm was not found on PATH."
  Write-Host "Install Node.js LTS from https://nodejs.org, then run MOBILE-SETUP.bat again."
  exit 1
}

Write-Host "Installing mobile app dependencies..."
npm install

Write-Host "Adding Android project if needed..."
if (-not (Test-Path (Join-Path $PSScriptRoot "android"))) {
  npm run mobile:add:android
}

Write-Host "Adding iOS project if needed..."
if (-not (Test-Path (Join-Path $PSScriptRoot "ios"))) {
  npm run mobile:add:ios
}

Write-Host "Syncing Capacitor..."
npm run mobile:sync

Write-Host ""
Write-Host "Mobile setup complete."
Write-Host "Android: run npm run mobile:open:android"
Write-Host "iOS: run npm run mobile:open:ios on a Mac with Xcode"
