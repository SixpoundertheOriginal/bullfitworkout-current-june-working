
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

interface CacheConfig {
  ttl: number;
  maxSize: number;
}

class NetworkOptimizationService {
  private requestCache = new Map<string, { data: any; timestamp: number; promise?: Promise<any> }>();
  private retryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2
  };
  private cacheConfig: CacheConfig = {
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 100
  };

  // Request deduplication with caching
  async deduplicate<T>(
    key: string,
    requestFn: () => Promise<T>,
    options: { force?: boolean; ttl?: number } = {}
  ): Promise<T> {
    const { force = false, ttl = this.cacheConfig.ttl } = options;
    const now = Date.now();

    // Check if we have a cached result
    if (!force) {
      const cached = this.requestCache.get(key);
      if (cached) {
        // Return cached data if still valid
        if (now - cached.timestamp < ttl && cached.data !== undefined) {
          return cached.data;
        }
        
        // Return pending promise if request is in flight
        if (cached.promise) {
          return cached.promise;
        }
      }
    }

    // Create new request with retry logic
    const promise = this.withRetry(requestFn)
      .then((result) => {
        // Update cache with result
        this.requestCache.set(key, {
          data: result,
          timestamp: now,
          promise: undefined
        });
        
        // Clean up old entries
        this.cleanupCache();
        
        return result;
      })
      .catch((error) => {
        // Remove failed request from cache
        this.requestCache.delete(key);
        throw error;
      });

    // Store pending promise
    this.requestCache.set(key, {
      data: undefined,
      timestamp: now,
      promise
    });

    return promise;
  }

  // Retry with exponential backoff
  private async withRetry<T>(
    requestFn: () => Promise<T>,
    attempt = 0
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      if (attempt >= this.retryConfig.maxRetries) {
        throw error;
      }

      // Check if error is retryable
      if (!this.isRetryableError(error)) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffFactor, attempt),
        this.retryConfig.maxDelay
      );

      console.log(`Retrying request in ${delay}ms (attempt ${attempt + 1}/${this.retryConfig.maxRetries})`);
      
      await this.delay(delay);
      return this.withRetry(requestFn, attempt + 1);
    }
  }

  private isRetryableError(error: any): boolean {
    // Network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return true;
    }
    
    // HTTP status codes that are retryable
    if (error.status) {
      return [408, 429, 500, 502, 503, 504].includes(error.status);
    }
    
    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private cleanupCache(): void {
    const now = Date.now();
    const entries = Array.from(this.requestCache.entries());
    
    // Remove expired entries
    entries.forEach(([key, entry]) => {
      if (now - entry.timestamp > this.cacheConfig.ttl) {
        this.requestCache.delete(key);
      }
    });

    // Remove oldest entries if cache is too large
    if (this.requestCache.size > this.cacheConfig.maxSize) {
      const sortedEntries = entries
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)
        .slice(0, this.requestCache.size - this.cacheConfig.maxSize);
      
      sortedEntries.forEach(([key]) => {
        this.requestCache.delete(key);
      });
    }
  }

  // Prefetch functionality
  async prefetch<T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<void> {
    try {
      await this.deduplicate(key, requestFn);
    } catch (error) {
      // Ignore prefetch errors
      console.warn('Prefetch failed:', error);
    }
  }

  // Cache management
  clearCache(): void {
    this.requestCache.clear();
  }

  getCacheStats() {
    return {
      size: this.requestCache.size,
      maxSize: this.cacheConfig.maxSize,
      entries: Array.from(this.requestCache.keys())
    };
  }
}

export const networkOptimization = new NetworkOptimizationService();
