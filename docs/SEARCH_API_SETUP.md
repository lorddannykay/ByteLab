# Search API Setup and Cost Management

## Google Custom Search API Configuration

### Endpoint
The implementation uses the correct endpoint format:
```
https://www.googleapis.com/customsearch/v1?key=YOUR_API_KEY&cx=YOUR_ENGINE_ID&q=SEARCH_TERM
```

No changes needed - the endpoint is already correctly configured in `lib/search/googleSearchProvider.ts`.

### Environment Variables

Add to `.env.local`:
```bash
# Required for Google Search
GOOGLE_SEARCH_API_KEY=your_api_key_here
GOOGLE_SEARCH_ENGINE_ID=e7233443ee18d4afb

# Optional: Rate limiting configuration (defaults shown)
GOOGLE_SEARCH_MAX_QUERIES_PER_DAY=100
GOOGLE_SEARCH_MAX_QUERIES_PER_HOUR=20
GOOGLE_SEARCH_MAX_QUERIES_PER_MINUTE=5

# Optional: Validation limits
MAX_SEARCHES_PER_VALIDATION=10
```

## Cost Management & Guardrails

### Google Custom Search API Pricing
- **Free Tier**: 100 queries per day
- **Paid**: $5 per 1,000 queries (after free tier)

### Built-in Guardrails

1. **Rate Limiting** (`lib/search/rateLimiter.ts`)
   - Tracks queries per minute, hour, and day
   - Prevents exceeding configured limits
   - Automatically falls back to Open Web Search when limits are reached

2. **Search Limits per Validation** (`lib/validation/contentValidator.ts`)
   - Limits total searches per content validation (default: 10)
   - Prevents excessive API usage during validation
   - Configurable via `MAX_SEARCHES_PER_VALIDATION` env var

3. **Caching** (`lib/search/searchService.ts`)
   - Caches search results for 5 minutes
   - Reduces duplicate API calls for same queries
   - Significantly reduces API usage

4. **Graceful Fallback**
   - If Google Search fails (rate limit, quota, error), automatically falls back to Open Web Search (DuckDuckGo)
   - Content generation continues even if search fails

5. **Error Handling**
   - Detects quota exceeded errors (403/429)
   - Provides clear error messages
   - Automatically switches to fallback provider

### Monitoring Usage

Check API usage via:
```bash
GET /api/search/usage
```

Returns:
```json
{
  "usage": {
    "lastMinute": 2,
    "lastHour": 15,
    "lastDay": 45,
    "limits": {
      "maxQueriesPerDay": 100,
      "maxQueriesPerHour": 20,
      "maxQueriesPerMinute": 5
    },
    "remainingToday": 55,
    "remainingThisHour": 5
  },
  "cache": {
    "size": 12,
    "entries": 12
  },
  "timestamp": 1234567890
}
```

### Recommended Settings

**For Free Tier (100 queries/day):**
```bash
GOOGLE_SEARCH_MAX_QUERIES_PER_DAY=100
GOOGLE_SEARCH_MAX_QUERIES_PER_HOUR=15
GOOGLE_SEARCH_MAX_QUERIES_PER_MINUTE=3
MAX_SEARCHES_PER_VALIDATION=5
```

**For Paid Tier:**
```bash
GOOGLE_SEARCH_MAX_QUERIES_PER_DAY=1000
GOOGLE_SEARCH_MAX_QUERIES_PER_HOUR=100
GOOGLE_SEARCH_MAX_QUERIES_PER_MINUTE=10
MAX_SEARCHES_PER_VALIDATION=20
```

### Cost Estimation

**Per Course Generation:**
- Average searches per validation: 5-10
- With caching: ~3-5 unique searches per course
- Free tier: ~20-30 courses per day
- Paid tier ($5/1000): ~$0.02-0.05 per course

### Best Practices

1. **Enable Caching**: Already enabled by default - don't disable unless needed
2. **Monitor Usage**: Check `/api/search/usage` regularly
3. **Adjust Limits**: Set limits based on your usage patterns
4. **Use Validation Selectively**: Disable validation for non-critical content if needed
5. **Fallback Works**: Open Web Search (DuckDuckGo) is free and always available as fallback

### Disabling Features

To disable content validation:
```typescript
const config: CourseConfig = {
  // ... other config
  enableContentValidation: false, // Disables web search validation
  enableAutoImages: true, // Keep images enabled
};
```

To disable both validation and images:
```typescript
const config: CourseConfig = {
  // ... other config
  enableContentValidation: false,
  enableAutoImages: false,
};
```



