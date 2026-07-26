param(
  [Parameter(Mandatory = $true)]
  [string]$TargetDataDir
)

$ErrorActionPreference = "Stop"

$siteDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$sourceDataDir = Join-Path $siteDir "data"
$resolvedTarget = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($TargetDataDir)

if (!(Test-Path -LiteralPath $sourceDataDir)) {
  throw "Source data folder was not found: $sourceDataDir"
}

New-Item -ItemType Directory -Force -Path $resolvedTarget | Out-Null
Copy-Item -LiteralPath (Join-Path $sourceDataDir "*") -Destination $resolvedTarget -Recurse -Force

Write-Host "Copied data files from:"
Write-Host "  $sourceDataDir"
Write-Host "to:"
Write-Host "  $resolvedTarget"
Write-Host ""
Write-Host "Set this environment variable before starting the server:"
Write-Host "  CE_DATA_DIR=$resolvedTarget"
Write-Host ""
Write-Host "The original data folder was left in place as a backup."
