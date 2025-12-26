# Vercel Deployment Guide for ByteLab

Complete guide to deploying ByteLab on Vercel.

---

## 🚀 Quick Deploy

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Sign in with your GitHub account

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select your GitHub repository: `lorddannykay/ByteLab`
   - Click "Import"

3. **Configure Project**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

4. **Add Environment Variables**
   - Click "Environment Variables" section
   - Add all required variables (see below)
   - Select environments: Production, Preview, Development

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://bytelab.vercel.app` (or custom domain)

---

## 🔑 Required Environment Variables

### Minimum Setup (Basic Functionality)

Add these in Vercel Dashboard → Settings → Environment Variables:

```bash
# At least ONE AI provider (required):
TOGETHER_API_KEY=your_together_api_key_here
# OR
OPENAI_API_KEY=your_openai_api_key_here
# OR
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### Full Setup (All Features)

```bash
# AI Providers (at least one required)
TOGETHER_API_KEY=your_together_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Media Search APIs (for image search features)
GOOGLE_SEARCH_API_KEY=your_google_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
PEXELS_API_KEY=your_pexels_api_key_here

# Optional Media APIs
UNSPLASH_ACCESS_KEY=your_unsplash_key_here
GIPHY_API_KEY=your_giphy_api_key_here

# Rate Limiting (optional - defaults provided)
GOOGLE_SEARCH_MAX_QUERIES_PER_DAY=100
GOOGLE_SEARCH_MAX_QUERIES_PER_HOUR=30
GOOGLE_SEARCH_MAX_QUERIES_PER_MINUTE=10
MAX_SEARCHES_PER_VALIDATION=5

# Observability (optional)
LANGFUSE_SECRET_KEY=your_langfuse_secret_key_here
LANGFUSE_PUBLIC_KEY=your_langfuse_public_key_here
LANGFUSE_HOST=https://cloud.langfuse.com
```

---

## 📋 Step-by-Step Deployment

### Step 1: Connect GitHub Repository

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select `lorddannykay/ByteLab`
4. Authorize Vercel to access your repository

### Step 2: Configure Build Settings

Vercel will auto-detect Next.js, but verify these settings:

- **Framework Preset:** Next.js
- **Root Directory:** `./`
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### Step 3: Add Environment Variables

1. In the project configuration, scroll to "Environment Variables"
2. Click "Add" for each variable
3. Add variables for:
   - **Production** (required)
   - **Preview** (optional, for PR previews)
   - **Development** (optional)

4. **Important:** Add at minimum ONE AI provider key:
   - `TOGETHER_API_KEY` (recommended)
   - `OPENAI_API_KEY`
   - `ANTHROPIC_API_KEY`

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete (2-5 minutes)
3. Your app will be live!

---

## ⚙️ Vercel Configuration

The `vercel.json` file is already configured with:

- **Function Timeouts:**
  - API routes: 60 seconds
  - Generation routes: 120 seconds
  - Studio routes: 120 seconds

- **Security Headers:**
  - X-Content-Type-Options
  - X-Frame-Options
  - X-XSS-Protection

- **Region:** `iad1` (US East)

---

## 🔄 Auto-Deployment

Once connected, Vercel will automatically:

- ✅ Deploy on every push to `main` branch
- ✅ Create preview deployments for pull requests
- ✅ Rebuild on environment variable changes
- ✅ Show build logs and deployment status

---

## 📊 Monitoring Deployments

### Check Deployment Status

1. Go to Vercel Dashboard
2. Select your project
3. View "Deployments" tab
4. See build logs, deployment status, and URLs

### View Build Logs

- Click on any deployment
- View "Build Logs" tab
- Check for errors or warnings

---

## 🐛 Troubleshooting

### Build Fails

**Issue:** Build errors during deployment

**Solutions:**
1. Check build logs in Vercel dashboard
2. Verify all dependencies in `package.json`
3. Ensure Node.js version is 18+ (Vercel auto-detects)
4. Check for TypeScript errors (should be ignored per `next.config.js`)

### Environment Variables Not Working

**Issue:** API calls failing after deployment

**Solutions:**
1. Verify environment variables are set in Vercel dashboard
2. Check variable names match exactly (case-sensitive)
3. Ensure variables are set for "Production" environment
4. Redeploy after adding variables

### Function Timeout Errors

**Issue:** API routes timing out

**Solutions:**
1. Check `vercel.json` for function timeout settings
2. Generation routes already set to 120 seconds
3. For longer operations, consider:
   - Breaking into smaller chunks
   - Using background jobs
   - Implementing streaming responses

### API Rate Limits

**Issue:** Hitting API rate limits

**Solutions:**
1. Check rate limiting configuration in environment variables
2. Monitor API usage in provider dashboards
3. Adjust `GOOGLE_SEARCH_MAX_QUERIES_PER_DAY` if needed
4. Consider upgrading API plans

---

## 🔒 Security Best Practices

### Environment Variables

- ✅ Never commit `.env.local` to git
- ✅ Use Vercel's environment variable management
- ✅ Use different keys for production/preview
- ✅ Rotate keys regularly

### API Keys

- ✅ Restrict API keys to specific domains/IPs when possible
- ✅ Monitor API usage in provider dashboards
- ✅ Set up alerts for unusual activity
- ✅ Use separate keys for development/production

---

## 📈 Performance Optimization

### Vercel Optimizations

- ✅ **Automatic:** Image optimization
- ✅ **Automatic:** Code splitting
- ✅ **Automatic:** Edge caching
- ✅ **Automatic:** CDN distribution

### Recommended Settings

1. **Enable Edge Functions** (if needed for specific routes)
2. **Use ISR** (Incremental Static Regeneration) for static content
3. **Optimize Images** using Next.js Image component
4. **Enable Compression** (automatic in Vercel)

---

## 🌐 Custom Domain

### Add Custom Domain

1. Go to Vercel Dashboard → Project → Settings → Domains
2. Click "Add Domain"
3. Enter your domain name
4. Follow DNS configuration instructions
5. Wait for DNS propagation (up to 48 hours)

### SSL Certificate

- ✅ Automatically provisioned by Vercel
- ✅ Auto-renewal enabled
- ✅ HTTPS enforced by default

---

## 📝 Post-Deployment Checklist

After deployment, verify:

- [ ] Application loads without errors
- [ ] Dashboard page displays correctly
- [ ] Can create a new course
- [ ] Can upload source files
- [ ] Can generate course content
- [ ] API endpoints respond correctly
- [ ] Environment variables are loaded
- [ ] No console errors in browser
- [ ] All features work as expected

---

## 🔄 Updating Deployment

### Automatic Updates

- Every push to `main` branch triggers a new deployment
- Pull requests create preview deployments
- Environment variable changes require manual redeploy

### Manual Redeploy

1. Go to Vercel Dashboard
2. Select your project
3. Go to "Deployments" tab
4. Click "..." on any deployment
5. Select "Redeploy"

---

## 📊 Analytics & Monitoring

### Vercel Analytics

1. Enable in Project Settings → Analytics
2. View real-time analytics
3. Monitor performance metrics
4. Track user behavior

### Error Monitoring

- Check Vercel Function Logs
- Monitor API response times
- Set up alerts for errors
- Review build logs regularly

---

## ✅ Deployment Checklist

Before deploying:

- [x] Code pushed to GitHub
- [x] `vercel.json` configured
- [x] Environment variables documented
- [x] Build command verified (`npm run build`)
- [x] Dependencies listed in `package.json`
- [x] No sensitive data in code
- [x] `.env.local` not committed

After deploying:

- [ ] Environment variables added in Vercel
- [ ] Build succeeds without errors
- [ ] Application loads correctly
- [ ] All features tested
- [ ] API endpoints working
- [ ] Custom domain configured (if needed)

---

## 🎯 Quick Reference

### Vercel Dashboard
- **URL:** https://vercel.com/dashboard
- **Project Settings:** Settings → General
- **Environment Variables:** Settings → Environment Variables
- **Deployments:** Deployments tab
- **Domains:** Settings → Domains

### Important URLs
- **Repository:** https://github.com/lorddannykay/ByteLab
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Deployment URL:** `https://bytelab.vercel.app` (or your custom domain)

---

## 🚀 Ready to Deploy!

Your ByteLab application is ready for Vercel deployment:

1. ✅ `vercel.json` configured
2. ✅ Build settings optimized
3. ✅ Function timeouts set
4. ✅ Security headers configured
5. ✅ Environment variables documented

**Next Steps:**
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Add environment variables
4. Click "Deploy"
5. Your app will be live in minutes!

---

**Last Updated:** December 19, 2025  
**Status:** ✅ Ready for Vercel Deployment

