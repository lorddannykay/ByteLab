# ByteLab Setup Checklist

Use this checklist to ensure your ByteLab installation is ready to run.

## ✅ Pre-Deployment Checklist

### 1. Essential Files Present
- [x] `package.json` - Dependencies and scripts
- [x] `tsconfig.json` - TypeScript configuration
- [x] `next.config.js` - Next.js configuration
- [x] `tailwind.config.ts` - Tailwind CSS configuration
- [x] `postcss.config.mjs` - PostCSS configuration
- [x] `.gitignore` - Git ignore rules
- [x] `README.md` - Project documentation
- [x] `.env.example` - Environment variables template
- [x] `LICENSE` - Apache 2.0 license

### 2. Documentation Files
- [x] `README.md` - Main documentation
- [x] `CHANGELOG.md` - Version history
- [x] `docs/DEPLOYMENT_SUMMARY.md` - Deployment guide
- [x] `docs/SEARCH_API_SETUP.md` - Search API setup
- [x] `docs/API_LIMITS_AND_FIXES.md` - API documentation
- [x] `docs/QUALITY_GUARDRAILS.md` - Quality checks guide

### 3. Core Application Structure
- [x] `app/` - Next.js app router pages
- [x] `app/api/` - API routes
- [x] `components/` - React components
- [x] `lib/` - Core libraries and utilities
- [x] `types/` - TypeScript type definitions
- [x] `contexts/` - React contexts
- [x] `public/` - Static assets

### 4. Dependencies
- [x] All dependencies listed in `package.json`
- [x] `framer-motion` - For animations
- [x] `langfuse` - For observability
- [x] `jszip` - For course exports
- [x] `pdf-parse` - For PDF parsing
- [x] `mammoth` - For DOCX parsing

## 🚀 Setup Steps

### Step 1: Clone Repository
```bash
git clone https://github.com/lorddannykay/ByteLab.git
cd ByteLab
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Variables
```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your API keys
# At minimum, add ONE AI provider key:
# - TOGETHER_API_KEY (recommended)
# - OPENAI_API_KEY
# - ANTHROPIC_API_KEY
```

### Step 4: Verify Installation
```bash
# Check if all dependencies are installed
npm list --depth=0

# Verify TypeScript compilation
npm run build

# Start development server
npm run dev
```

### Step 5: Test Application
1. Open http://localhost:3000
2. Verify dashboard loads
3. Test course creation flow
4. Check API endpoints are working

## 🔑 Required API Keys

### Minimum Setup (Basic Functionality)
- **One AI Provider** (choose one):
  - `TOGETHER_API_KEY` (recommended - cost-effective)
  - `OPENAI_API_KEY`
  - `ANTHROPIC_API_KEY`

### Full Setup (All Features)
- **AI Provider** (at least one)
- **Media Search**:
  - `GOOGLE_SEARCH_API_KEY` + `GOOGLE_SEARCH_ENGINE_ID`
  - `PEXELS_API_KEY`
- **Optional Media**:
  - `UNSPLASH_ACCESS_KEY`
  - `GIPHY_API_KEY`
- **Observability** (optional):
  - `LANGFUSE_SECRET_KEY` + `LANGFUSE_PUBLIC_KEY`

## 📋 Post-Setup Verification

### Application Health Checks
- [ ] Dashboard page loads without errors
- [ ] Can create a new course
- [ ] Can upload source files (PDF, DOCX, TXT)
- [ ] Can generate course content
- [ ] Can preview course in editor
- [ ] Can export course (HTML, SCORM, ZIP)

### API Endpoints
- [ ] `/api/generate/outline` - Outline generation
- [ ] `/api/generate/content` - Content generation
- [ ] `/api/media/*` - Media search (if configured)
- [ ] `/api/upload/*` - File upload
- [ ] `/api/export/*` - Course export

### Features
- [ ] Image search modal opens
- [ ] Can search for images (if APIs configured)
- [ ] Can upload custom media files
- [ ] Template selector works
- [ ] Live preview renders correctly
- [ ] HTML preview works
- [ ] Save functionality works

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**
   - Check Node.js version (18+ required)
   - Run `npm install` again
   - Clear `.next` folder: `rm -rf .next`

2. **API Errors**
   - Verify API keys in `.env.local`
   - Check API key permissions
   - Verify API quotas not exceeded

3. **TypeScript Errors**
   - Run `npm run build` to see all errors
   - Check `tsconfig.json` is correct
   - Verify all dependencies installed

4. **Missing Features**
   - Check if required API keys are set
   - Verify environment variables are loaded
   - Check browser console for errors

## 📝 Notes

- **Gumroad Illustrations**: The `assets/Gumroad Illustrations/` folder is not required for app functionality. It's for future use.
- **Large Files**: Two large files (>100MB) are excluded from git (see `.gitignore`)
- **Local Storage**: Course data is stored in browser localStorage by default
- **No Database Required**: The app works without a database (uses localStorage)

## ✅ Ready to Deploy

Once all checks pass:
1. ✅ All files committed to git
2. ✅ Environment variables documented
3. ✅ Dependencies installed
4. ✅ Application runs locally
5. ✅ All features tested

**Status**: Ready for deployment! 🚀

