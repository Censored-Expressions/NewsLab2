@echo off
setlocal
cd /d "%~dp0"
echo Starting Censored Expressions...
echo.
"C:\Users\ellis\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" server.js
pause
