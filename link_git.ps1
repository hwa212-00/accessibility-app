$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
git init
git config user.name "PM HWA"
git config user.email "hwayeon212@gmail.com"

# 기존 리모트가 있다면 삭제 후 다시 연결
git remote remove origin 2>$null
git remote add origin https://github.com/hwa212-00/accessibility-app.git

git add .
git commit -m "feat: AntiGravity 코드 업데이트"
git branch -M main

# 혹시 레포지토리에 README 등이 있다면 먼저 가져오기
git pull origin main --allow-unrelated-histories --no-edit 2>$null

# 깃허브로 밀어넣기(푸시)
git push -u origin main
