import { NextRequest, NextResponse } from 'next/server';
import { getSearchService } from '@/lib/search/searchService';
import { getRateLimiter } from '@/lib/search/rateLimiter';

/**
 * Get search API usage statistics
 */
export async function GET(request: NextRequest) {
  try {
    const searchService = getSearchService();
    
    // Get usage from rate limiter
    const rateLimiter = getRateLimiter();
    const usage = rateLimiter.getUsage();

    // Get cache stats
    const cacheStats = searchService.getCacheStats();

    return NextResponse.json({
      usage: {
        lastMinute: usage.lastMinute,
        lastHour: usage.lastHour,
        lastDay: usage.lastDay,
        limits: usage.limits,
        remainingToday: Math.max(0, usage.limits.maxQueriesPerDay - usage.lastDay),
        remainingThisHour: Math.max(0, usage.limits.maxQueriesPerHour - usage.lastHour),
      },
      cache: cacheStats,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error getting search usage:', error);
    return NextResponse.json(
      { error: 'Failed to get usage statistics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

