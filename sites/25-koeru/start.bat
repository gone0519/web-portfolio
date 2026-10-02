@echo off
cd /d "%~dp0"
echo KOERU site preview: http://localhost:8765/
echo Close this window to stop the server.
start "" "http://localhost:8765/%%E3%%82%%B3%%E3%%82%%A8%%E3%%83%%AB%%20-%%20%%E3%%82%%B3%%E3%%83%%BC%%E3%%83%%9D%%E3%%83%%AC%%E3%%83%%BC%%E3%%83%%88%%E3%%82%%B5%%E3%%82%%A4%%E3%%83%%88.dc.html"
python -m http.server 8765
if errorlevel 1 py -m http.server 8765
pause
