# 构建所有项目

# 1. 构建主项目（Vue）
Write-Host "Building main project..." -ForegroundColor Green
npm run build

# 2. 构建 wordflow 项目（React）
Write-Host "Building wordflow project..." -ForegroundColor Green
cd wordflow
npm run build
cd ..

# 3. 将 wordflow 复制到 dist/wordfall
Write-Host "Copying wordflow to dist/wordfall..." -ForegroundColor Green
if (Test-Path "dist/wordfall") {
    Remove-Item -Recurse -Force "dist/wordfall"
}
Copy-Item -Recurse -Force "wordflow/dist" "dist/wordfall"

# 4. 复制 vercel.json 到 dist
Write-Host "Copying vercel.json to dist..." -ForegroundColor Green
Copy-Item -Force "vercel.json" "dist/vercel.json"

Write-Host "Build complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Output structure:" -ForegroundColor Cyan
Write-Host "  dist/index.html       - Main welcome page"
Write-Host "  dist/mbti/index.html  - MBTI test"
Write-Host "  dist/wordfall/        - Wordfall game"
