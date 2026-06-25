@echo off
title AI Ready Engineers - Local Server
echo.
echo  ====================================
echo   AI Ready Engineers - Netlify Dev Server
echo  ====================================
echo.
echo  Starting server on http://localhost:8888
echo.
echo  Pages:
echo    - Home:     http://localhost:8888
echo    - Courses:  http://localhost:8888/courses.html
echo    - About:    http://localhost:8888/about.html
echo    - Contact:  http://localhost:8888/contact.html
echo.
echo  Press Ctrl+C to stop the server
echo  ====================================
echo.
cd /d "%~dp0"
call npx netlify dev
pause
