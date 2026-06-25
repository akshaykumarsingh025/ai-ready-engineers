@echo off
title AI Ready Engineers - Local Server
echo.
echo  ====================================
echo   AI Ready Engineers - Local Server
echo  ====================================
echo.
echo  Starting server on http://localhost:8080
echo.
echo  Pages:
echo    - Home:     http://localhost:8080
echo    - Courses:  http://localhost:8080/courses.html
echo    - About:    http://localhost:8080/about.html
echo    - Contact:  http://localhost:8080/contact.html
echo.
echo  Press Ctrl+C to stop the server
echo  ====================================
echo.
cd /d "%~dp0"
python -m http.server 8080
pause
