@echo off
title EduPortal Classroom Manager
echo ===================================================
echo   Starting EduPortal Classroom Management System
echo ===================================================
echo.
echo 1. Launching Backend Express Server on port 5000...
start "EduPortal Backend" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 3 /nobreak >nul

echo 2. Launching Frontend React App on port 5173...
start "EduPortal Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ===================================================
echo   System running!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo ===================================================
echo.
pause

