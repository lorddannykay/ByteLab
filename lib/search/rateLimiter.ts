/**
 * Rate limiter for search API calls to prevent exceeding quotas
 */

interface RateLimitConfig {
  maxQueriesPerDay: number;
  maxQueriesPerHour: number;
  maxQueriesPerMinute: number;
}

interface QueryRecord {
  timestamp: number;
  query: string;
}

class RateLimiter {
  private queries: QueryRecord[] = [];
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    // Clean up old records periodically
    setInterval(() => this.cleanup(), 60000); // Every minute
  }

  /**
   * Check if a query can be made without exceeding rate limits
   */
  canMakeQuery(): { allowed: boolean; reason?: string; retryAfter?: number } {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    // Count queries in each time window
    const queriesLastMinute = this.queries.filter(q => q.timestamp > oneMinuteAgo).length;
    const queriesLastHour = this.queries.filter(q => q.timestamp > oneHourAgo).length;
    const queriesLastDay = this.queries.filter(q => q.timestamp > oneDayAgo).length;

    // Check limits
    if (queriesLastDay >= this.config.maxQueriesPerDay) {
      const oldestQuery = this.queries.find(q => q.timestamp > oneDayAgo);
      const retryAfter = oldestQuery ? Math.ceil((oneDayAgo + 24 * 60 * 60 * 1000 - now) / 1000) : 3600;
      return {
        allowed: false,
        reason: `Daily limit of ${this.config.maxQueriesPerDay} queries exceeded`,
        retryAfter,
      };
    }

    if (queriesLastHour >= this.config.maxQueriesPerHour) {
      const oldestQuery = this.queries.find(q => q.timestamp > oneHourAgo);
      const retryAfter = oldestQuery ? Math.ceil((oneHourAgo + 60 * 60 * 1000 - now) / 1000) : 60;
      return {
        allowed: false,
        reason: `Hourly limit of ${this.config.maxQueriesPerHour} queries exceeded`,
        retryAfter,
      };
    }

    if (queriesLastMinute >= this.config.maxQueriesPerMinute) {
      const oldestQuery = this.queries.find(q => q.timestamp > oneMinuteAgo);
      const retryAfter = oldestQuery ? Math.ceil((oneMinuteAgo + 60 * 1000 - now) / 1000) : 10;
      return {
        allowed: false,
        reason: `Per-minute limit of ${this.config.maxQueriesPerMinute} queries exceeded`,
        retryAfter,
      };
    }

    return { allowed: true };
  }

  /**
   * Record a query
   */
  recordQuery(query: string): void {
    this.queries.push({
      timestamp: Date.now(),
      query,
    });
  }

  /**
   * Get current usage statistics
   */
  getUsage(): {
    lastMinute: number;
    lastHour: number;
    lastDay: number;
    limits: RateLimitConfig;
  } {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    return {
      lastMinute: this.queries.filter(q => q.timestamp > oneMinuteAgo).length,
      lastHour: this.queries.filter(q => q.timestamp > oneHourAgo).length,
      lastDay: this.queries.filter(q => q.timestamp > oneDayAgo).length,
      limits: { ...this.config },
    };
  }

  /**
   * Clean up old query records
   */
  private cleanup(): void {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    this.queries = this.queries.filter(q => q.timestamp > oneDayAgo);
  }

  /**
   * Reset all records (useful for testing or manual reset)
   */
  reset(): void {
    this.queries = [];
  }
}

// Default configuration based on Google Custom Search API
// Free tier: 100 queries/day (no per-minute limit in API, but we add one for safety)
// Paid: $5 per 1,000 queries after free tier
// Note: Google doesn't enforce per-minute limits, but we add them to prevent burst usage
const DEFAULT_CONFIG: RateLimitConfig = {
  maxQueriesPerDay: parseInt(process.env.GOOGLE_SEARCH_MAX_QUERIES_PER_DAY || '100'),
  maxQueriesPerHour: parseInt(process.env.GOOGLE_SEARCH_MAX_QUERIES_PER_HOUR || '30'),
  maxQueriesPerMinute: parseInt(process.env.GOOGLE_SEARCH_MAX_QUERIES_PER_MINUTE || '10'), // Increased from 5 to 10
};

// Singleton instance
let rateLimiterInstance: RateLimiter | null = null;

export function getRateLimiter(): RateLimiter {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new RateLimiter(DEFAULT_CONFIG);
  }
  return rateLimiterInstance;
}

export { RateLimiter, RateLimitConfig };

