@echo off
title OrdinancaPro - Sistemi i Menaxhimit
echo Po niset serveri i databazes...
start /min cmd /c "node server.js"
echo Po hapet aplikacioni ne browser...
start build\index.html
echo.
echo OrdinancaPro po punon! Mos e mbyll kete dritare nese deshiron ruajtjen automatike ne PC.
echo Tani te dhenat ruhen ne skedarin: database.json
pause
