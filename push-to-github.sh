#!/bin/bash

# Rishabh Vendor Connect - GitHub Push Script
# Run this script after creating the GitHub repository

echo "🚀 Rishabh Vendor Connect - GitHub Push Setup"
echo "=============================================="
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository. Please run this from the project root."
    exit 1
fi

# Get repository URL from user
echo "📝 Please provide your GitHub repository URL:"
echo "   Example: https://github.com/yourusername/rishabh-vendor-connect.git"
echo ""
read -p "GitHub Repository URL: " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ Error: Repository URL is required."
    exit 1
fi

echo ""
echo "🔗 Adding remote origin..."
git remote add origin "$REPO_URL"

echo "📤 Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ Success! Your Rishabh Vendor Connect project has been pushed to GitHub!"
echo ""
echo "🌐 Repository URL: $REPO_URL"
echo ""
echo "📋 Next Steps:"
echo "1. Visit your repository on GitHub"
echo "2. Verify all files are uploaded correctly"
echo "3. Follow the deployment guide to deploy on Render"
echo "4. Share the repository with your team"
echo ""
echo "📚 Documentation:"
echo "- README.md: Project overview and setup"
echo "- DEPLOYMENT_GUIDE.md: Complete deployment instructions"
echo "- QUICK_DEPLOYMENT_CHECKLIST.md: 30-minute deployment guide"
echo "- USER_LOGIN_CREDENTIALS.md: User roles and login details"
echo ""
echo "🎉 Happy coding!"
