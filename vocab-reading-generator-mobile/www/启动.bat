@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Starting VocabTool...
echo.
node start.js
pause
