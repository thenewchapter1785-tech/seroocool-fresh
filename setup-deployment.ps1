# Quick deployment setup script for Windows

Write-Host "🚀 DigitalOcean Deployment Quick Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check for git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host "❌ Git is not installed" -ForegroundColor Red
  exit 1
}

Write-Host "✅ Git found" -ForegroundColor Green
Write-Host ""

# Initialize git if not already
if (-not (Test-Path ".git")) {
  Write-Host "📝 Initializing Git repository..." -ForegroundColor Yellow
  git init
  git add .
  git commit -m "Initial commit: Ready for DigitalOcean deployment"
  Write-Host "✅ Git repository initialized" -ForegroundColor Green
} else {
  Write-Host "✅ Git repository already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 Setup Checklist:" -ForegroundColor Cyan
Write-Host "  [ ] 1. Push to GitHub: git remote add origin <repo-url> && git push -u origin main"
Write-Host "  [ ] 2. Get DigitalOcean Access Token from https://cloud.digitalocean.com/account/api/tokens"
Write-Host "  [ ] 3. Create DigitalOcean App: https://cloud.digitalocean.com/apps"
Write-Host "  [ ] 4. Copy your App ID from the DigitalOcean dashboard"
Write-Host "  [ ] 5. Add GitHub Secrets in your repo Settings:"
Write-Host "       - DIGITALOCEAN_ACCESS_TOKEN"
Write-Host "       - DIGITALOCEAN_APP_ID"
Write-Host "  [ ] 6. Update app.json with your GitHub username"
Write-Host "  [ ] 7. Push to main branch to trigger automatic deployment"
Write-Host ""
Write-Host "📖 Full guide: Get-Content DEPLOYMENT.md" -ForegroundColor Cyan
Write-Host ""
