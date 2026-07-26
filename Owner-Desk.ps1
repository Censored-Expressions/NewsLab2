param(
  [switch]$NoOpen
)

$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

$port = if ($env:PORT) { [int]$env:PORT } else { 3000 }
$baseUrl = "http://127.0.0.1:$port"
$ownerUrl = "$baseUrl/owner-desk.html"
$node = "C:\Users\ellis\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
$log = Join-Path $PSScriptRoot "owner-desk-launch.log"
$pidFile = Join-Path $PSScriptRoot "owner-desk-server.pid"

function Write-OwnerLog($message) {
  "[$(Get-Date)] $message" | Out-File -LiteralPath $log -Append -Encoding utf8
}

function Test-OwnerDesk {
  try {
    $response = Invoke-WebRequest -UseBasicParsing "$baseUrl/owner-desk.html" -TimeoutSec 3
    return $response.StatusCode -eq 200
  } catch {
    return $false
  }
}

Write-OwnerLog "Owner Desk launcher started."

if (-not (Test-OwnerDesk)) {
  if (-not (Test-Path -LiteralPath $node)) {
    $node = "node"
  }

  Write-Host "Starting Censored Expressions local server on $baseUrl..."
  Write-OwnerLog "Starting server.js with $node"
  $process = Start-Process -FilePath $node -ArgumentList "server.js" -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -PassThru
  $process.Id | Out-File -LiteralPath $pidFile -Encoding ascii

  $ready = $false
  for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Seconds 1
    if (Test-OwnerDesk) {
      $ready = $true
      break
    }
  }

  if (-not $ready) {
    Write-OwnerLog "Owner Desk did not become reachable."
    throw "Owner Desk did not start. Run RUN-SITE.bat and try again."
  }
} else {
  Write-OwnerLog "Existing local server is already serving Owner Desk."
}

Write-Host "Opening Owner Desk: $ownerUrl"
Write-OwnerLog "Opening $ownerUrl"

if (-not $NoOpen) {
  Start-Process $ownerUrl
}

Write-Host "Owner Desk is ready."
