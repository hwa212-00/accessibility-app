@echo off
chcp 65001
echo 코드를 깃허브로 업로드합니다... 잠시만 기다려주세요.
powershell -ExecutionPolicy Bypass -Command "$env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User'); cd 'C:\Users\Senseone\.gemini\antigravity\scratch\accessibility-app'; git add .; git commit -m 'Convert to SPA and add Home view'; git push -u origin main --force; git push origin main:gh-pages --force"
echo.
echo 업로드가 완료되었습니다! 이제 아무 키나 눌러 창을 닫아주세요.
pause
