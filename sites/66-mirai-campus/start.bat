@echo off
rem MIRAI CAMPUS admissions site - local preview.
rem Opening the .dc.html files directly (file://) does not work, so this starts a small local server.
rem Requires Python 3. Close this window to stop the server.
cd /d "%~dp0"
start "" "http://127.0.0.1:8030/Top.dc.html"
python -m http.server 8030 --bind 127.0.0.1
