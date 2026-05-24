@echo off
title Meso Shqip me AI - Startup
cd /d "%~dp0"

echo ==================================================
echo         MESOSHQIP STARTUP SYSTEM
echo ==================================================
echo.

echo [1/4] Duke kontrolluar nese Node.js eshte i instaluar...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo GABIM: Node.js nuk u gjet! 
    echo Ju lutem instaloni Node.js nga https://nodejs.org/
    pause
    exit /b
)

echo [2/4] Duke pastruar portin 5001...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5001') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo [3/4] Duke nisur serverin...
:: Perdorim 'call' per te siguruar qe node thirret korrektesisht
start "MesoShqip Server" cmd /c "node server.js || pause"

echo Po presim 3 sekonda...
timeout /t 3 >nul

echo [4/4] Duke verifikuar serverin...
netstat -aon | findstr :5001 >nul
if %errorlevel% neq 0 (
    echo.
    echo GABIM: Serveri dhashtoi te niset!
    echo Kontrolloni dritaren "MesoShqip Server" per gabime ne kod.
    echo.
    pause
    exit /b
)

echo.
echo [SUKSES] MesoShqip po punon!
echo Duke hapur browserin...
start http://localhost:5001

echo.
echo ==================================================
echo MOS E MBYLL DRITAREN "MesoShqip Server"
echo ==================================================
timeout /t 5
exit
