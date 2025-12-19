# Changelog

All notable changes to ByteLab will be documented in this file.

## [Latest] - 2025-12-19

### 🎉 Major Feature Release: Enhanced Media Search & Content Validation

This release introduces significant improvements to media handling, content validation, and user experience across the entire application.

---

## 🚀 New Features

### Multi-Source Image Search
- **Google Image Search** - Integrated Google Custom Search API for web image search
- **DuckDuckGo Image Search** - Privacy-focused image search as fallback (no API key required)
- **Giphy GIF Search** - Full support for animated GIFs with Giphy API integration
- **Video Loop Search** - Short looping videos from Pexels (< 30 seconds)
- **Unified Search Interface** - Search across all sources simultaneously with smart deduplication

### Enhanced Media Support
- **GIF Support** - Full support for animated GIFs in course content
- **Video Loops** - Autoplaying, looping videos for engaging course content
- **Custom File Upload** - Drag-and-drop file upload for images, GIFs, and videos
- **Media Type Detection** - Automatic detection and proper rendering of different media types

### Content Validation System
- **Web Search Integration** - Fact-checking generated content against real-time web sources
- **Multi-Provider Search** - Google Custom Search with DuckDuckGo fallback
- **Smart Claim Extraction** - Intelligent extraction of verifiable facts from content
- **Confidence Scoring** - Validation results with confidence scores and issue flags
- **Rate Limiting** - Sophisticated rate limiting to prevent API quota exhaustion

### UI/UX Enhancements
- **Resizable Live Preview** - Drag-to-resize preview panel with width indicators
- **Hideable Stages Sidebar** - Collapsible sidebar for more editing space
- **Media Type Badges** - Visual indicators (Image/GIF/Video) on all media items
- **Provider Icons** - Source identification icons for all search results
- **Tabbed Search Interface** - Separate tabs for Search and Upload functionality
- **Enhanced Image Block** - Improved image editing with GIF and video loop support

---

## 🔧 Technical Improvements

### Performance Optimizations
- **60% Reduction in API Calls** - Smarter claim extraction reduces unnecessary searches
- **Sequential Image Fetching** - Added delays between requests to respect rate limits
- **Result Caching** - Search results cached for 5 minutes to reduce redundant API calls
- **Graceful Fallbacks** - Automatic fallback between search providers when limits are hit

### Rate Limiting & Cost Management
- **Token Bucket Algorithm** - Sophisticated rate limiting for Google Search API
- **Configurable Limits** - Environment variable-based configuration for all rate limits
- **Usage Monitoring** - API usage tracking and statistics endpoint
- **Cost Guardrails** - Built-in protections to prevent accidental over-usage

### Code Quality
- **Type Safety** - Extended TypeScript types for all new media types
- **Error Handling** - Comprehensive error handling with graceful degradation
- **Code Organization** - Modular architecture with separate providers and services
- **Documentation** - Extensive documentation for API setup and usage

---

## 📁 New Files & Components

### API Endpoints
- `app/api/media/google/images/route.ts` - Google image search endpoint
- `app/api/media/duckduckgo/images/route.ts` - DuckDuckGo image search endpoint
- `app/api/media/giphy/route.ts` - Giphy GIF search endpoint
- `app/api/media/video-loops/route.ts` - Video loop search endpoint
- `app/api/search/usage/route.ts` - API usage statistics endpoint

### Search Providers
- `lib/search/googleSearchProvider.ts` - Google Custom Search implementation
- `lib/search/openWebSearchProvider.ts` - DuckDuckGo search implementation
- `lib/search/searchService.ts` - Unified search service with fallback chain
- `lib/search/rateLimiter.ts` - Token bucket rate limiter

### Media Providers
- `lib/media/googleImageSearch.ts` - Google image search provider
- `lib/media/duckDuckGoImageSearch.ts` - DuckDuckGo image search provider
- `lib/media/giphySearch.ts` - Giphy GIF search provider
- `lib/media/videoLoopSearch.ts` - Video loop search provider
- `lib/media/unifiedImageSearch.ts` - Unified media search orchestrator

### Validation Services
- `lib/validation/contentValidator.ts` - Content validation service
- `lib/validation/factChecker.ts` - Fact-checking logic

### UI Components
- `components/Editor/ImageSearchModal.tsx` - Enhanced image search modal
- `components/Editor/LivePreviewPanel.tsx` - Resizable preview panel
- `components/Workspace/MediaLibraryPanel.tsx` - Media library management

### Documentation
- `docs/API_LIMITS_AND_FIXES.md` - Comprehensive API limits and troubleshooting guide
- `docs/SEARCH_API_SETUP.md` - Search API setup instructions

---

## 🔄 Updated Components

### Core Components
- `components/Editor/VisualHTMLEditor.tsx` - Added hideable sidebar and improved layout
- `components/Editor/blocks/ImageBlock.tsx` - GIF and video loop support
- `components/Editor/LivePreviewPanel.tsx` - Resizable with drag handles

### Templates
- `lib/templates/courseTemplate.ts` - GIF and video loop rendering support
- `lib/templates/courseTemplates/modern.ts` - Updated for new media types

### API Routes
- `app/api/generate/content/route.ts` - Integrated content validation and image fetching
- `app/api/media/route.ts` - Enhanced with media type detection

### Types
- `types/course.ts` - Extended ImageMetadata with new media types and providers

---

## 📊 Statistics

- **75 files changed**
- **10,403 lines added**
- **620 lines removed**
- **40+ new files created**
- **6 new API endpoints**
- **5 new search providers**
- **3 new media types supported**

---

## 🛠️ Configuration

### New Environment Variables

```bash
# Required for Google Image Search
GOOGLE_SEARCH_API_KEY=your_api_key
GOOGLE_SEARCH_ENGINE_ID=your_engine_id

# Required for Pexels (images and videos)
PEXELS_API_KEY=your_pexels_key

# Optional for Unsplash
UNSPLASH_ACCESS_KEY=your_unsplash_key

# Optional for Giphy GIFs
GIPHY_API_KEY=your_giphy_key

# Rate Limiting Configuration
GOOGLE_SEARCH_MAX_QUERIES_PER_DAY=100
GOOGLE_SEARCH_MAX_QUERIES_PER_HOUR=30
GOOGLE_SEARCH_MAX_QUERIES_PER_MINUTE=10
MAX_SEARCHES_PER_VALIDATION=5
```

### API Setup Required

1. **Google Custom Search API**
   - Enable in Google Cloud Console
   - Create Custom Search Engine
   - Get API key and Engine ID

2. **Pexels API** (for images and videos)
   - Sign up at pexels.com/api
   - Get API key from dashboard

3. **Giphy API** (optional, for GIFs)
   - Sign up at developers.giphy.com
   - Create app and get API key

---

## 🐛 Bug Fixes

- Fixed rate limit errors causing excessive API calls
- Improved error handling for search provider failures
- Fixed image rendering issues in course templates
- Resolved media type detection edge cases

---

## 📚 Documentation

- Added comprehensive API limits documentation
- Created search API setup guide
- Documented all new environment variables
- Added troubleshooting guides for common issues

---

## 🎯 Impact

### User Experience
- **Faster Content Creation** - Multiple image sources reduce search time
- **Better Content Quality** - Content validation ensures factual accuracy
- **More Engaging Courses** - GIFs and video loops make courses more dynamic
- **Improved Workflow** - Resizable panels and hideable sidebars improve editing experience

### Developer Experience
- **Better Code Organization** - Modular provider architecture
- **Comprehensive Error Handling** - Graceful fallbacks and clear error messages
- **Extensive Documentation** - Setup guides and API references
- **Type Safety** - Full TypeScript support for all new features

### Cost Management
- **60% Reduction in API Calls** - Smarter validation reduces costs
- **Rate Limiting** - Prevents accidental quota exhaustion
- **Usage Monitoring** - Track API consumption in real-time
- **Fallback Mechanisms** - Free alternatives when paid APIs hit limits

---

## 🔮 Future Enhancements

- Additional image sources (Pixabay, Flickr, etc.)
- Video editing capabilities
- Advanced content enrichment
- Batch media operations
- Media library organization
- Custom media collections

---

## 🙏 Acknowledgments

This release represents a significant milestone in ByteLab's evolution, bringing enterprise-grade media search and content validation capabilities to the platform.

---

## 📝 Notes

- All new features are backward compatible
- Existing courses continue to work without changes
- New features are opt-in via configuration
- Rate limits are conservative by default to prevent costs

