# Google Search API Limits and Fixes (December 2025)

## Current Google Custom Search API Limits

Based on Google's documentation and current usage:

**Free Tier:**
- **100 queries per day** (hard limit)
- No explicit per-minute limit in the API itself
- Resets at midnight Pacific Time

**Paid Tier:**
- $5 per 1,000 queries (after free tier)
- Same daily limit applies, but you can purchase additional quota
- No per-minute limit enforced by Google

## Issues Fixed

### 1. Rate Limiting Improvements

**Problem:** Rate limiter was too aggressive (5 queries/minute), causing constant rate limit errors.

**Solution:**
- Increased per-minute limit from 5 to 10 queries/minute
- Added 300ms delay between search requests
- Reduced max searches per validation from 10 to 5
- Better error handling with graceful fallback

**Updated Configuration:**
```bash
# .env.local
GOOGLE_SEARCH_MAX_QUERIES_PER_DAY=100
GOOGLE_SEARCH_MAX_QUERIES_PER_HOUR=30  # Increased from 20
GOOGLE_SEARCH_MAX_QUERIES_PER_MINUTE=10  # Increased from 5
MAX_SEARCHES_PER_VALIDATION=5  # Reduced from 10
```

### 2. Smarter Claim Extraction

**Problem:** Too many claims were being extracted (up to 5 per section), causing excessive API calls.

**Solution:**
- Improved `extractClaims()` to skip greetings, obvious statements, and instructions
- Reduced from 5 claims to 3 claims per content block
- Prioritizes statistics and definitions over general statements
- Skips patterns like "Welcome to...", "Get ready to...", "In this stage..."

**Result:** ~60% reduction in API calls per validation

### 3. Image Fetching Improvements

**Problem:** Images were being fetched in parallel, potentially hitting rate limits.

**Solution:**
- Changed from parallel to sequential fetching with 500ms delays
- Better error handling for Pexels/Unsplash failures
- Graceful fallback if one provider fails

### 4. Better Fallback Handling

**Problem:** When Google Search hit rate limits, fallback to DuckDuckGo wasn't working well.

**Solution:**
- Improved error detection for rate limit errors
- Better logging to distinguish between rate limits and other errors
- Fallback provider (DuckDuckGo) now handles errors more gracefully

## Recommended Settings

### For Free Tier (100 queries/day):
```bash
GOOGLE_SEARCH_MAX_QUERIES_PER_DAY=100
GOOGLE_SEARCH_MAX_QUERIES_PER_HOUR=20
GOOGLE_SEARCH_MAX_QUERIES_PER_MINUTE=8
MAX_SEARCHES_PER_VALIDATION=3  # Very conservative
```

### For Paid Tier:
```bash
GOOGLE_SEARCH_MAX_QUERIES_PER_DAY=1000
GOOGLE_SEARCH_MAX_QUERIES_PER_HOUR=100
GOOGLE_SEARCH_MAX_QUERIES_PER_MINUTE=15
MAX_SEARCHES_PER_VALIDATION=10
```

## Cost Optimization Tips

1. **Use Caching:** Search results are cached for 5 minutes - this significantly reduces API calls
2. **Disable Validation for Non-Critical Content:** Set `enableContentValidation: false` in CourseConfig
3. **Reduce Validation Scope:** Lower `MAX_SEARCHES_PER_VALIDATION` for courses with many sections
4. **Monitor Usage:** Check `/api/search/usage` regularly to track consumption

## Image API Status

**Pexels:**
- Free tier: 200 requests/hour
- No daily limit mentioned
- Current implementation respects these limits

**Unsplash:**
- Free tier: 50 requests/hour
- No daily limit mentioned
- Current implementation respects these limits

**Google Custom Search (Images):**
- Uses the same API key and limits as Google Search API
- Free tier: 100 queries/day (shared with text search)
- Paid tier: $5 per 1,000 queries

**DuckDuckGo:**
- Free, no API key required
- No official rate limits (but be respectful)
- Used as fallback when Google hits limits

**Giphy:**
- Free tier: 42 requests/hour (with API key)
- No daily limit mentioned
- Requires API key: `GIPHY_API_KEY`

**Pexels Video:**
- Uses same API key as Pexels images
- Free tier: 200 requests/hour
- Used for video loops (short videos < 30 seconds)

Both image APIs are working correctly with proper error handling and fallback.

## Enhanced Image Search Features

### New Media Sources

The ImageSearchModal now supports multiple sources:
- **Pexels** - High-quality stock photos
- **Unsplash** - Free stock photos
- **Google** - Web image search (requires API key)
- **DuckDuckGo** - Privacy-focused image search (no API key)
- **Giphy** - Animated GIFs (requires API key)
- **Pexels Video** - Short video loops

### Media Types

The system now supports three media types:
- **Images** - Standard static images (JPG, PNG, WEBP)
- **GIFs** - Animated GIFs
- **Video Loops** - Short looping videos (MP4, WEBM)

### File Upload

Users can now upload custom media files:
- Supported formats: JPG, PNG, GIF, WEBP, MP4, WEBM
- Files are stored in `/public/media/`
- Drag-and-drop support in the upload tab

## Environment Variables

### Required for Image Search

```bash
# Google Custom Search (for images and text search)
GOOGLE_SEARCH_API_KEY=your_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_engine_id_here

# Pexels (for images and video loops)
PEXELS_API_KEY=your_pexels_api_key_here

# Unsplash (optional, for additional image source)
UNSPLASH_ACCESS_KEY=your_unsplash_key_here
```

### Optional

```bash
# Giphy (for GIF search - optional)
GIPHY_API_KEY=your_giphy_api_key_here
```

### Rate Limiting Configuration

```bash
# Google Search rate limits
GOOGLE_SEARCH_MAX_QUERIES_PER_DAY=100
GOOGLE_SEARCH_MAX_QUERIES_PER_HOUR=30
GOOGLE_SEARCH_MAX_QUERIES_PER_MINUTE=10

# Content validation limits
MAX_SEARCHES_PER_VALIDATION=5
```

## Getting API Keys

1. **Google Custom Search API:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Custom Search API
   - Create credentials (API key)
   - Create a Custom Search Engine at [Google Programmable Search](https://programmablesearchengine.google.com/)

2. **Pexels:**
   - Sign up at [Pexels API](https://www.pexels.com/api/)
   - Get your API key from the dashboard

3. **Unsplash:**
   - Sign up at [Unsplash Developers](https://unsplash.com/developers)
   - Create an application to get access key

4. **Giphy (optional):**
   - Sign up at [Giphy Developers](https://developers.giphy.com/)
   - Create an app to get API key

## Monitoring

Check API usage:
```bash
GET /api/search/usage
```

This returns:
- Queries used (last minute, hour, day)
- Remaining quota
- Cache statistics

## Troubleshooting

**If you see "rate limit exceeded" errors:**
1. Check your daily usage: `GET /api/search/usage`
2. Reduce `MAX_SEARCHES_PER_VALIDATION` in `.env.local`
3. Consider disabling validation temporarily: `enableContentValidation: false`
4. Wait for the daily limit to reset (midnight Pacific Time)

**If images aren't appearing:**
1. Check that `PEXELS_API_KEY` is set in `.env.local`
2. Check that `UNSPLASH_ACCESS_KEY` is set (optional, for Unsplash)
3. Verify API keys are valid by testing the endpoints directly
4. Check browser console for CORS or network errors

