$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot
$node = "C:\Users\ellis\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
$log = Join-Path $PSScriptRoot "server-start.log"
"[$(Get-Date)] Starting launcher from $PSScriptRoot" | Out-File -LiteralPath $log -Encoding utf8

$existingListeners = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
foreach ($listener in $existingListeners) {
  $process = Get-Process -Id $listener.OwningProcess -ErrorAction SilentlyContinue
  if ($process) {
    Write-Host "Restarting local preview on port 3000..."
    "[$(Get-Date)] Stopping existing process $($process.Id) $($process.ProcessName)" | Out-File -LiteralPath $log -Append -Encoding utf8
    Stop-Process -Id $process.Id -Force
    Start-Sleep -Seconds 1
  }
}

Write-Host "Starting Censored Expressions on http://localhost:3000"
Write-Host "Leave this window open while previewing the site."
"[$(Get-Date)] Launching node server.js with $node" | Out-File -LiteralPath $log -Append -Encoding utf8
& $node server.js
