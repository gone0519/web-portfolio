@echo off
cd /d %~dp0
start "" http://127.0.0.1:8035/Home.dc.html
python -m http.server 8035 --bind 127.0.0.1
