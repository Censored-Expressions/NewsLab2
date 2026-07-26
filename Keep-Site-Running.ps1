$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

$node = "C:\Users\ellis\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
$log = Join-Path $PSScriptRoot "server-watchdog.log"
$restartDelaySeconds = 10

"[$(Get-Date)] Watchdog starting from $PSScriptRoot" | Out-File -LiteralPath $log -Encoding utf8

while ($true) {
  try {
    "[$(Get-Date)] Starting server.js" | Out-File -LiteralPath $log -Append -Encoding utf8
    & $node server.js 2>&1 | Tee-Object -FilePath $log -Append
    "[$(Get-Date)] server.js exited. Restarting in $restartDelaySeconds seconds." | Out-File -LiteralPath $log -Append -Encoding utf8
  } catch {
    "[$(Get-Date)] Watchdog caught error: $($_.Exception.Message)" | Out-File -LiteralPath $log -Append -Encoding utf8
  }
  Start-Sleep -Seconds $restartDelaySeconds
}
