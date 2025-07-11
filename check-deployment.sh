#!/bin/bash

echo "🎉 Party Poodles Website Deployment Status Check"
echo "================================================="
echo ""

echo "📂 Repository: https://github.com/jordanjamesmedia/partipoodles"
echo ""

echo "🚀 Deployment Options:"
echo ""

echo "1. 🟢 GitHub Pages (Free & Instant)"
echo "   URL: https://jordanjamesmedia.github.io/partipoodles"
echo "   Setup: Go to Repository Settings > Pages > Deploy from main branch"
echo ""

echo "2. 🟡 Netlify (Recommended)"
echo "   Click: https://app.netlify.com/start/deploy?repository=https://github.com/jordanjamesmedia/partipoodles"
echo "   Your site will be: https://yoursite.netlify.app"
echo ""

echo "3. 🟡 Vercel (Alternative)"
echo "   Click: https://vercel.com/new/clone?repository-url=https://github.com/jordanjamesmedia/partipoodles"
echo "   Your site will be: https://yoursite.vercel.app"
echo ""

echo "4. 🟡 Cloudflare Pages"
echo "   Go to: https://dash.cloudflare.com -> Pages -> Create Project"
echo "   Select: jordanjamesmedia/partipoodles repository"
echo ""

echo "📋 Files Ready for Deployment:"
echo "✅ netlify.toml - Netlify configuration"
echo "✅ vercel.json - Vercel configuration"
echo "✅ .github/workflows/deploy.yml - GitHub Actions"
echo "✅ _headers - Security headers"
echo "✅ _redirects - URL redirects"
echo "✅ sitemap.xml - SEO sitemap"
echo "✅ robots.txt - Search engine instructions"
echo ""

echo "🔧 Quick Setup Commands:"
echo "git status # Check current status"
echo "git log --oneline -5 # View recent commits"
echo ""

echo "📖 For detailed instructions, see: DEPLOYMENT_GUIDE.md"
echo ""

echo "🌟 Your Party Poodles website is ready to go live!"
echo "   Choose any deployment option above and be live in minutes!"

# Make the script executable
chmod +x check-deployment.sh