@echo off
REM YAP-IS — Windows tek tiklama launcher
setlocal
set ROOT=%~dp0..
cd /d "%ROOT%"

echo [1/2] AI servisi (port 9000)...
start "YAP-IS AI" cmd /k "cd /d %ROOT%\ai && pip install -q -r requirements.txt && python predictor.py"

timeout /t 3 /nobreak >nul

echo [2/2] Backend + Frontend (port 8000)...
set AI_SERVICE_URL=http://127.0.0.1:9000
start "YAP-IS Backend" cmd /k "cd /d %ROOT%\backend && pip install -q -r requirements.txt && python main.py"

timeout /t 4 /nobreak >nul
echo.
echo ============================================
echo   Dashboard:  http://127.0.0.1:8000/
echo   API docs:   http://127.0.0.1:8000/docs
echo   Login:      AY001 / ayse123
echo ============================================
start "" http://127.0.0.1:8000/
endlocal
