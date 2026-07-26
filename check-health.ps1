$ErrorActionPreference = "Stop"

$baseUrl = "http://localhost:3000"

Write-Host "Checking Censored Expressions backend health..."
Write-Host ""

try {
  $health = Invoke-RestMethod "$baseUrl/api/health?refresh=1"
  $shield = Invoke-RestMethod "$baseUrl/api/ai-shield"

  Write-Host "Health: $($health.health)"
  Write-Host "Score: $($health.score)"
  Write-Host "Stories: $($health.storyCount)"
  Write-Host "Major: $($health.categoryCounts.major) | Sports: $($health.categoryCounts.sports) | Local: $($health.categoryCounts.local)"
  Write-Host ""

  if ($shield.aiShield.findings.Count) {
    Write-Host "Findings:"
    $shield.aiShield.findings | ForEach-Object {
      Write-Host "- [$($_.severity)] $($_.message)"
    }
  } else {
    Write-Host "No active findings."
  }

  if ($shield.aiShield.recommendations.Count) {
    Write-Host ""
    Write-Host "Recommendations:"
    $shield.aiShield.recommendations | ForEach-Object {
      Write-Host "- $_"
    }
  }
} catch {
  Write-Host "Health check could not reach the local site."
  Write-Host "Make sure RUN-SITE.bat is open and the site is running at $baseUrl"
  Write-Host $_.Exception.Message
}
