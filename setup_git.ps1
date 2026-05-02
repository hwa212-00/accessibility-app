$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
git init
git config user.name "PM HWA"
git config user.email "hwayeon212@gmail.com"
git add .
git commit -m "feat: Initial accessibility-app commit by AntiGravity"
gh repo create accessibility-app --public --source=. --remote=origin --push
gh api -X POST /repos/$(gh api user -q ".login")/accessibility-app/pages -f "source[branch]=main" -f "source[path]=/"
