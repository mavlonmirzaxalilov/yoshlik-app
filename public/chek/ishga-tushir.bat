@echo off
title Yoshlik - chek dasturi
cd /d "%~dp0"
:qayta
node chek-dasturi.mjs
echo Dastur to'xtadi. 10 soniyadan keyin qayta ishga tushadi (yopish uchun oynani yoping)...
timeout /t 10 >nul
goto qayta
