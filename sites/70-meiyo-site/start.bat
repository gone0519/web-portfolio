@echo off
rem Start a local web server for this folder and open the top page.
cd /d "%~dp0"
where python >nul 2>nul
if %errorlevel%==0 (
  start "meiyo-site server" /min python -m http.server 8765
) else (
  start "meiyo-site server" /min npx --yes http-server -p 8765 -c-1
)
timeout /t 2 >nul
start "" "http://localhost:8765/Admissions%%20Site.dc.html"
