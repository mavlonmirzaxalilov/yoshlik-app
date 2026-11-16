@echo off
title Yoshlik - chek dasturi
cd /d "%~dp0"
:qayta
node chek-dasturi.mjs
if errorlevel 3 if not errorlevel 4 (
  timeout /t 5 >nul
  exit /b
)
echo Dastur to'xtadi. 10 soniyadan keyin qayta ishga tushadi (yopish uchun oynani yoping)...
timeout /t 10 >nul
goto qayta
