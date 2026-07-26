@echo off
title Censored Expressions Local Site
cd /d "%~dp0"
echo Starting Censored Expressions from:
echo %cd%
echo.
echo Checking Node...
set "NODE_EXE=C:\Users\ellis\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%NODE_EXE%" (
  echo Node was not found at:
  echo %NODE_EXE%
  echo.
  echo Trying system Node instead...
  set "NODE_EXE=node"
)
echo.
echo Launching site at http://localhost:3000
echo Keep this window open while previewing.
echo.
"%NODE_EXE%" server.js
echo.
echo The site stopped or could not start.
pause
