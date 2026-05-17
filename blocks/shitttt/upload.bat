@echo off
git add .
set /p msg="Enter commit message: "
if "%msg%"=="" set msg=update
git commit -m "%msg%"
git push origin main
pause
