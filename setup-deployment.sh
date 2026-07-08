#!/bin/bash
# Quick deployment setup script

echo "🚀 DigitalOcean Deployment Quick Setup"
echo "======================================"
echo ""

# Check for git
if ! command -v git &> /dev/null; then
  echo "❌ Git is not installed"
  exit 1
fi

echo "✅ Git found"
echo ""

# Initialize git if not already
if [ ! -d ".git" ]; then
  echo "📝 Initializing Git repository..."
  git init
  git add .
  git commit -m "Initial commit: Ready for DigitalOcean deployment"
  echo "✅ Git repository initialized"
else
  echo "✅ Git repository already exists"
fi

echo ""
echo "📋 Setup Checklist:"
echo "  [ ] 1. Push to GitHub: git remote add origin <repo-url> && git push -u origin main"
echo "  [ ] 2. Get DigitalOcean Access Token from https://cloud.digitalocean.com/account/api/tokens"
echo "  [ ] 3. Create DigitalOcean App: https://cloud.digitalocean.com/apps"
echo "  [ ] 4. Copy your App ID from the DigitalOcean dashboard"
echo "  [ ] 5. Add GitHub Secrets:"
echo "       - DIGITALOCEAN_ACCESS_TOKEN"
echo "       - DIGITALOCEAN_APP_ID"
echo "  [ ] 6. Update app.json with your GitHub username"
echo "  [ ] 7. Push to main branch to trigger automatic deployment"
echo ""
echo "📖 Full guide: cat DEPLOYMENT.md"
echo ""
