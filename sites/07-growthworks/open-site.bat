@echo off
rem Open the GROWTHWORKS site locally (requires Python)
cd /d "%~dp0"
start "" http://127.0.0.1:8931/Home.dc.html
python -m http.server 8931 --bind 127.0.0.1
