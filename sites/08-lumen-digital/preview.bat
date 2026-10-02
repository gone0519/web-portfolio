@echo off
cd /d "%~dp0"
start "" "http://127.0.0.1:8030/LUMEN%%20Digital.dc.html"
python -m http.server 8030 --bind 127.0.0.1

