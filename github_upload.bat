@echo off
chcp 65001
echo 코드를 깃허브로 업로드합니다... 잠시만 기다려주세요.
git add .
git commit -m "Update Shorts UI layout"
git push -u origin main --force
git push origin main:gh-pages --force
echo.
echo 업로드가 완료되었습니다! 이제 창을 닫아주세요.
pause
