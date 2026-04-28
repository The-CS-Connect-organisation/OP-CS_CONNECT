# Cloudflare Pages Dual Hosting Setup Guide

This guide will help you deploy your app to Cloudflare Pages while keeping GitHub Pages active.

## 🎯 What This Setup Does

- **GitHub Pages**: `https://your-org.github.io/OP-CS_CONNECT/` (existing)
- **Cloudflare Pages**: `https://your-custom-domain.com/` (new, cleaner URLs)
- **Zero code changes needed** - works on both platforms simultaneously

## 📋 Prerequisites

1. Cloudflare account (free tier works)
2. Custom domain configured in Cloudflare (optional but recommended)
3. GitHub repository access

## 🚀 Setup Steps

### Step 1: Create Cloudflare Pages Project

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → **Pages**
3. Click **Create a project**
4. Choose **Connect to Git**
5. Select your GitHub repository: `OP-CS_CONNECT`
6. Configure build settings:

```
Project name: cornerstone-schoolsync (or your choice)
Production branch: main
Build command: (leave empty)
Build output directory: deploy
Root directory: /
```

7. Click **Save and Deploy**

### Step 2: Configure Custom Domain (Optional)

1. In your Cloudflare Pages project, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `app.cornerstone.edu`)
4. Follow DNS setup instructions
5. Wait for SSL certificate to provision (~5 minutes)

### Step 3: Verify Deployment

Once deployed, test both URLs:

**GitHub Pages (existing):**
- Landing: `https://your-org.github.io/OP-CS_CONNECT/`
- Academics: `https://your-org.github.io/OP-CS_CONNECT/academics/`
- Management: `https://your-org.github.io/OP-CS_CONNECT/management/`

**Cloudflare Pages (new):**
- Landing: `https://your-domain.com/` or `https://your-domain.com/OP-CS_CONNECT/`
- Academics: `https://your-domain.com/academics/` or `https://your-domain.com/OP-CS_CONNECT/academics/`
- Management: `https://your-domain.com/management/` or `https://your-domain.com/OP-CS_CONNECT/management/`

Both URL patterns work thanks to the `_redirects` file!

## 🔧 How It Works

The `_redirects` file in the root directory tells Cloudflare Pages to:

1. **Rewrite URLs**: `/OP-CS_CONNECT/*` → `/*` (cleaner URLs)
2. **Handle SPA routing**: Fallback to `index.html` for client-side routing
3. **Support both patterns**: Works with or without `/OP-CS_CONNECT/` prefix

## 📊 Deployment Flow

```
GitHub Push → GitHub Actions Build → Deploy Artifact
                                    ↓
                    ┌───────────────┴───────────────┐
                    ↓                               ↓
            GitHub Pages                    Cloudflare Pages
    (with /OP-CS_CONNECT/ path)         (with clean URLs)
```

## 🎨 Benefits of Dual Hosting

✅ **Zero downtime migration** - Both work simultaneously
✅ **No code changes** - Same build works on both platforms
✅ **Backward compatibility** - Old GitHub Pages URLs still work
✅ **Better performance** - Cloudflare's global CDN
✅ **Preview deployments** - Every PR gets a preview URL on Cloudflare
✅ **Web Analytics** - Built-in analytics on Cloudflare

## 🔄 Automatic Deployments

Every push to `main` branch will:
1. Trigger GitHub Actions workflow
2. Build all 3 apps (landing, academics, management)
3. Deploy to GitHub Pages (via workflow)
4. Cloudflare Pages auto-detects the new commit and deploys

## 🛠️ Troubleshooting

### Issue: 404 errors on page refresh
**Solution**: The `_redirects` file handles this. Make sure it's included in the deploy folder.

### Issue: Assets not loading
**Solution**: Check that the `base` path in Vite configs is set to `/OP-CS_CONNECT/`

### Issue: CORS errors
**Solution**: Update your backend CORS settings to allow your Cloudflare domain:
```js
const allowedOrigins = [
  'https://your-org.github.io',
  'https://your-cloudflare-domain.com',
  'https://your-custom-domain.com'
];
```

### Issue: Cloudflare build fails
**Solution**: Make sure the `_redirects` file is in the root of your deploy folder. The GitHub Actions workflow handles this automatically.

## 📝 Next Steps

1. **Test thoroughly** on both platforms
2. **Update DNS** to point your custom domain to Cloudflare
3. **Monitor analytics** on Cloudflare dashboard
4. **Consider disabling GitHub Pages** once Cloudflare is stable (optional)

## 🔗 Useful Links

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Redirects & Rewrites](https://developers.cloudflare.com/pages/configuration/redirects/)
- [Custom Domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)

## 💡 Pro Tips

- Use Cloudflare's **Preview Deployments** for testing PRs
- Enable **Web Analytics** for privacy-friendly tracking
- Set up **Branch Deployments** for staging environments
- Use **Environment Variables** for different configs per environment

---

**Need help?** Check the Cloudflare Pages documentation or reach out to your team.
