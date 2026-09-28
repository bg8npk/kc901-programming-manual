@echo off
cd /d "%~dp0"
where py >nul 2>nul
if not errorlevel 1 (
    py -3 build.py
) else (
    python build.py
)
if errorlevel 1 (
    echo Build failed. Install Python 3.9 or newer and check the error above.
) else (
    echo index.html is ready.
)
pause
