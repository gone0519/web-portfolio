@echo off
chcp 65001 >nul
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (
  echo Python が見つかりません。表示方法.txt をご覧ください。
  pause
  exit /b
)
start "" "http://127.0.0.1:8124/University%%20Admissions.dc.html"
echo プレビュー中です。終了するにはこのウィンドウを閉じてください。
python -m http.server 8124 --bind 127.0.0.1
