@echo off
REM YAP-IS — Windows tek tiklama launcher (TEK PROSES)
setlocal
set ROOT=%~dp0..
cd /d "%ROOT%\backend"

REM python veya py — hangisi varsa onu kullan
where python >nul 2>&1
if %ERRORLEVEL%==0 (
  set PYCMD=python
) else (
  where py >nul 2>&1
  if %ERRORLEVEL%==0 (
    set PYCMD=py
  ) else (
    echo HATA: Python bulunamadi. https://python.org/downloads adresinden kurun.
    pause
    exit /b 1
  )
)

echo [1/2] Bagimliliklar yukleniyor...
%PYCMD% -m pip install -q -r requirements.txt
if errorlevel 1 (
  echo Bagimlilik yuklenemedi. Internet baglantisini kontrol edin.
  pause
  exit /b 1
)

echo [2/2] YAP-IS basliyor: http://127.0.0.1:8000/
start "" http://127.0.0.1:8000/
%PYCMD% main.py
endlocal
