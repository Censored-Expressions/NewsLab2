@echo off
title Censored Expressions Owner Desk
cd /d "%~dp0"
powershell.exe -ExecutionPolicy Bypass -File "%~dp0Owner-Desk.ps1"
if errorlevel 1 (
  echo.
  echo Owner Desk could not be opened.
  pause
)
