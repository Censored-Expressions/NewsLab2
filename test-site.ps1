$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot
$node = "C:\Users\ellis\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
$process = Start-Process -FilePath $node -ArgumentList "server.js" -WorkingDirectory $PSScriptRoot -PassThru -WindowStyle Hidden

try {
  Start-Sleep -Seconds 2
  $home = Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:3000/"
  $css = Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:3000/styles.css"
  $script = Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:3000/app.js"
  $news = Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:3000/api/news"

  [pscustomobject]@{
    HomepageStatus = $home.StatusCode
    CssStatus = $css.StatusCode
    ScriptStatus = $script.StatusCode
    NewsApiStatus = $news.StatusCode
    OldMockTextPresent = $home.Content -match "Refresh mock feed|Control Room|Admin control"
    HasYoutubeLiveCard = $home.Content -match "youtube-live-card|Watch Live on YouTube"
    FrontendUsesNewsApi = $script.Content -match "/api/news"
    NewsApiHasStories = $news.Content -match '"stories"'
  } | Format-List
}
finally {
  if ($process -and !$process.HasExited) {
    Stop-Process -Id $process.Id -Force
  }
}
