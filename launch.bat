@echo off
title AI Ready Engineers - Netlify Dev Server
cd /d "%~dp0"
echo Starting Netlify Dev Server...
echo The site will automatically load or be available at http://localhost:8888
timeout /t 2 /nobreak >nul
start "" "http://localhost:8888"
call npx netlify dev
pause
